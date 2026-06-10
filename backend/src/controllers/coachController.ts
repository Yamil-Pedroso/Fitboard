import { Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthReq } from "../types/domain";
import { CoachConversation } from "../models/CoachConversation";
import { User } from "../models/User";
import { Meal } from "../models/Meal";
import { Recipe } from "../models/Recipe";
import { Routine } from "../models/Routine";
import { Progress } from "../models/Progress";
import { getCoachModel, getOpenAIClient } from "../utils/openai";

const ChatDto = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().trim().optional(),
});

function makeTitle(message: string) {
  const clean = message.replace(/\s+/g, " ").trim();
  if (clean.length <= 60) return clean || "Fitboard Coach";
  return `${clean.slice(0, 57)}...`;
}

async function buildUserContext(userId: string) {
  const [user, recentMeals, recentRecipes, recentRoutines, recentProgress] =
    await Promise.all([
      User.findById(userId)
        .select(
          "email username preferences macroGoals subscription active createdAt",
        )
        .lean(),
      Meal.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(12).lean(),
      Recipe.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(8)
        .select("name servings ingredients categoryIds updatedAt")
        .lean(),
      Routine.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(8)
        .select(
          "name blocks tags estimatedDurationMin lastPerformedAt timesPerformed isArchived updatedAt",
        )
        .lean(),
      Progress.find({ userId })
        .sort({ date: -1 })
        .limit(8)
        .select(
          "date timeOfDay unitSystem weight_kg waist_cm body wellness activity notes tags",
        )
        .lean(),
    ]);

  return JSON.stringify(
    {
      profile: user
        ? {
            username: user.username,
            preferences: user.preferences,
            macroGoals: user.macroGoals,
            subscription: user.subscription,
            active: user.active,
          }
        : null,
      recentMeals,
      recentRecipes: recentRecipes.map((recipe) => ({
        _id: recipe._id,
        name: recipe.name,
        servings: recipe.servings,
        ingredientsCount: recipe.ingredients?.length ?? 0,
        ingredients: recipe.ingredients?.slice(0, 6),
        categoryIds: recipe.categoryIds,
      })),
      recentRoutines: recentRoutines.map((routine) => ({
        _id: routine._id,
        name: routine.name,
        tags: routine.tags,
        estimatedDurationMin: routine.estimatedDurationMin,
        lastPerformedAt: routine.lastPerformedAt,
        timesPerformed: routine.timesPerformed,
        isArchived: routine.isArchived,
        blocks: routine.blocks?.map((block) => ({
          title: block.title,
          exerciseType: block.exerciseType,
          exercisesCount: block.exercises?.length ?? 0,
          exercises: block.exercises?.slice(0, 5).map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            restSec: exercise.restSec,
            loadKg: exercise.loadKg,
            rir: exercise.rir,
          })),
        })),
      })),
      recentProgress,
    },
    null,
    2,
  );
}

const FITBOARD_COACH_INSTRUCTIONS = `
You are Fitboard Coach, a careful, practical coach for nutrition, fitness, recovery, sleep, body-composition progress, and healthy habit building.

Use the authenticated user's Fitboard context when it is relevant: macro goals, recent meals, recipes, routines, progress entries, preferences, and previous messages in this conversation.

Behavior:
- Reply in the same language the user uses unless they ask otherwise.
- Give specific, actionable advice with clear next steps.
- Prefer sustainable habits over extreme restriction.
- Consider nutrition, training load, sleep, stress, hydration, adherence, and recovery together.
- When data is missing, ask one or two useful questions instead of inventing facts.
- Do not diagnose disease, prescribe medication, treat injuries, or replace a doctor, registered dietitian, or mental-health professional.
- For red flags such as chest pain, fainting, severe restriction, eating disorder signs, pregnancy complications, serious injury, or medical conditions, advise professional care promptly.
- If the user asks for calories/macros/training guidance, explain assumptions and keep recommendations conservative.
- Keep answers concise but complete enough to be useful in an app chat.
`;

export const listCoachConversations = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const conversations = await CoachConversation.find({
      userId: req.auth.userId,
    })
      .sort({ updatedAt: -1 })
      .limit(30)
      .select("title updatedAt createdAt messages modelName")
      .lean();

    res.json({
      items: conversations.map((conversation) => ({
        _id: conversation._id,
        title: conversation.title,
        modelName: conversation.modelName,
        messagesCount: conversation.messages?.length ?? 0,
        lastMessage:
          conversation.messages?.[conversation.messages.length - 1] ?? null,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      })),
    });
  },
);

export const getCoachConversation = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const conversation = await CoachConversation.findOne({
      _id: req.params.id,
      userId: req.auth.userId,
    }).lean();

    if (!conversation) return res.status(404).json({ error: "Not found" });

    res.json(conversation);
  },
);

export const sendCoachMessage = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { message, conversationId } = ChatDto.parse(req.body);

    let conversation = conversationId
      ? await CoachConversation.findOne({
          _id: conversationId,
          userId: req.auth.userId,
        })
      : null;

    if (conversationId && !conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation) {
      conversation = await CoachConversation.create({
        userId: req.auth.userId,
        title: makeTitle(message),
        messages: [],
      });
    }

    const userContext = await buildUserContext(req.auth.userId);
    const model = getCoachModel();
    const openai = getOpenAIClient();
    const history = conversation.messages.slice(-16).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const response = await openai.responses.create({
      model,
      instructions: FITBOARD_COACH_INSTRUCTIONS,
      input: [
        {
          role: "user",
          content: `Fitboard user context JSON:\n${userContext}`,
        },
        ...history,
        {
          role: "user",
          content: message,
        },
      ],
    } as any);

    const reply = response.output_text?.trim();

    if (!reply) {
      return res.status(502).json({ error: "Coach did not return a reply" });
    }

    conversation.messages.push(
      {
        role: "user",
        content: message,
        createdAt: new Date(),
      },
      {
        role: "assistant",
        content: reply,
        responseId: response.id,
        createdAt: new Date(),
      },
    );
    conversation.lastResponseId = response.id;
    conversation.modelName = model;
    await conversation.save();

    res.json({
      conversationId: conversation._id,
      message: {
        role: "assistant",
        content: reply,
        responseId: response.id,
        createdAt: new Date(),
      },
      conversation,
    });
  },
);

export const deleteCoachConversation = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const deleted = await CoachConversation.deleteOne({
      _id: req.params.id,
      userId: req.auth.userId,
    });

    if (!deleted.deletedCount) return res.status(404).json({ error: "Not found" });

    res.json({ ok: true });
  },
);
