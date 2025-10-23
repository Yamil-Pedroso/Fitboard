import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Routine } from "../models/Routine";

type AuthReq = Request & { auth?: { userId: string } };

// Reused DTOs from the model
import {
  CreateRoutineDto as BaseCreateRoutineDto,
  UpdateRoutineDto as BaseUpdateRoutineDto,
} from "../models/Routine";

const CreateRoutineDto = BaseCreateRoutineDto;
const UpdateRoutineDto = BaseUpdateRoutineDto; // PATCH partial
const ReplaceRoutineDto = CreateRoutineDto; // PUT complete

/** ========== Listado con filtros/paginación ========== */
const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(), // text: name, blocks, exercises
  tag: z.string().optional(), // a tag or list "a,b,c"
  templatesOnly: z.coerce.boolean().optional(),
  includeArchived: z.coerce.boolean().optional(),
  sort: z
    .enum([
      "name",
      "-name",
      "createdAt",
      "-createdAt",
      "lastPerformedAt",
      "-lastPerformedAt",
      "timesPerformed",
      "-timesPerformed",
    ])
    .default("-createdAt"),
});

export const listRoutines = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { page, limit, q, tag, templatesOnly, includeArchived, sort } =
      ListQuery.parse(req.query);
    const skip = (page - 1) * limit;

    const filter: any = { userId: req.auth.userId };

    if (!includeArchived) filter.isArchived = false;
    if (templatesOnly) filter.isTemplate = true;

    if (q) {
      // Simple regex search (if you need performance later, create a text index)
      const rx = { $regex: q, $options: "i" };
      filter.$or = [
        { name: rx },
        { "blocks.title": rx },
        { "blocks.exercises.name": rx },
      ];
    }

    if (tag) {
      const tags = tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length > 0) filter.tags = { $in: tags };
    }

    const [items, total] = await Promise.all([
      Routine.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Routine.countDocuments(filter),
    ]);

    res.json({ page, limit, total, items });
  }
);

export const getRoutine = asyncHandler(async (req: AuthReq, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const item = await Routine.findOne({
    _id: req.params.id,
    userId: req.auth.userId,
  }).lean();

  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

export const createRoutine = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const data = CreateRoutineDto.parse(req.body);

    try {
      const doc = await Routine.create({ ...data, userId: req.auth.userId });
      res.status(201).json(doc);
    } catch (err: any) {
      if (err?.code === 11000) {
        return res
          .status(409)
          .json({ error: "A routine with that name already exists." });
      }
      throw err;
    }
  }
);

export const updateRoutine = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const patch = UpdateRoutineDto.parse(req.body);

    try {
      const updated = await Routine.findOneAndUpdate(
        { _id: req.params.id, userId: req.auth.userId },
        { $set: patch },
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (err: any) {
      if (err?.code === 11000) {
        return res
          .status(409)
          .json({ error: "Another routine already exists with that name." });
      }
      throw err;
    }
  }
);

export const replaceRoutine = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const data = ReplaceRoutineDto.parse(req.body);

    const updated = await Routine.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { ...data, userId: req.auth.userId },
      { new: true, runValidators: true, overwrite: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  }
);

export const deleteRoutine = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const del = await Routine.deleteOne({
      _id: req.params.id,
      userId: req.auth.userId,
    });
    if (!del.deletedCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  }
);

const DuplicateQuery = z.object({ name: z.string().trim().optional() });
export const duplicateRoutine = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { name } = DuplicateQuery.parse(req.query);

    const original = await Routine.findOne({
      _id: req.params.id,
      userId: req.auth.userId,
    }).lean();

    if (!original) return res.status(404).json({ error: "Not found" });

    const newName = name?.trim() || `${original.name} (copy)`;

    try {
      const copy = await Routine.create({
        userId: req.auth.userId,
        name: newName,
        blocks: original.blocks ?? [],
        tags: original.tags ?? [],
        isTemplate: original.isTemplate ?? false,
        isArchived: false,
        estimatedDurationMin: original.estimatedDurationMin,
        lastPerformedAt: undefined,
        timesPerformed: 0,
      });
      res.status(201).json(copy);
    } catch (err: any) {
      if (err?.code === 11000) {
        return res
          .status(409)
          .json({ error: "A routine with that name already exists." });
      }
      throw err;
    }
  }
);

export const archiveRoutine = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const upd = await Routine.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: { isArchived: true } },
      { new: true }
    );
    if (!upd) return res.status(404).json({ error: "Not found" });
    res.json(upd);
  }
);

export const unarchiveRoutine = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const upd = await Routine.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: { isArchived: false } },
      { new: true }
    );
    if (!upd) return res.status(404).json({ error: "Not found" });
    res.json(upd);
  }
);

const MarkPerformedDto = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
export const markPerformed = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });
    const { date } = MarkPerformedDto.parse(req.body);

    const asDate = date ? new Date(`${date}T00:00:00.000Z`) : new Date();

    const upd = await Routine.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: { lastPerformedAt: asDate }, $inc: { timesPerformed: 1 } },
      { new: true }
    );
    if (!upd) return res.status(404).json({ error: "Not found" });
    res.json(upd);
  }
);

export function routinesErrorBoundary(
  err: any,
  _req: Request,
  res: Response,
  next: Function
) {
  if (err instanceof ZodError) {
    // Avoid flatten() if your version marks it as deprecated
    return res.status(400).json({ errors: err.format() });
  }
  next(err);
}
