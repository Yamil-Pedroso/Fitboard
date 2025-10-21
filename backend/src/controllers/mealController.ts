import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AuthReq } from "../types/domain";
import { Meal } from "../models/Meal";
import {
  CreateMealDto as BaseCreateMealDto,
  UpdateMealDto as BaseUpdateMealDto,
} from "../models/Meal";
import { ListAllQuery } from "../dto/meals/mealsDto";

const CreateMealDto = BaseCreateMealDto;
const UpdateMealDto = BaseUpdateMealDto;
const ReplaceMealDto = CreateMealDto; // NO .partial()

// GET /meals?from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=20&q=search&slot=&sort=
export const listAllMeals = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const { page, limit, q, from, to, slot, sort } = ListAllQuery.parse(
      req.query
    );
    const skip = (page - 1) * limit;

    const filter: any = { userId: req.auth.userId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    if (slot) filter.slot = slot;
    if (q) {
      // busca por nombre de customItem si existe
      filter["customItem.name"] = { $regex: q, $options: "i" };
    }

    const [items, total] = await Promise.all([
      Meal.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Meal.countDocuments(filter),
    ]);

    res.json({ page, limit, total, items });
  }
);

// GET /meals/day?date=YYYY-MM-DD
const ListByDayQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const listMealsByDay = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });
    const { date } = ListByDayQuery.parse(req.query);

    const items = await Meal.find({ userId: req.auth.userId, date })
      .sort({ slot: 1, createdAt: 1 })
      .lean();

    res.json({ date, items });
  }
);

// GET /meals/range?from=YYYY-MM-DD&to=YYYY-MM-DD
const ListRangeQuery = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const listMealsByRange = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });
    const { from, to } = ListRangeQuery.parse(req.query);

    const items = await Meal.find({
      userId: req.auth.userId,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1, slot: 1 })
      .lean();

    res.json({ from, to, items });
  }
);

// POST /meals
export const createMeal = asyncHandler(async (req: AuthReq, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const data = CreateMealDto.parse(req.body);
  try {
    const doc = await Meal.create({
      ...data,
      userId: req.auth.userId,
    });
    return res.status(201).json(doc);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({
        error:
          "A meal for this date and slot already exists. Use update or move.",
      });
    }
    throw err;
  }
});

// GET /meals/:id
export const getMeal = asyncHandler(async (req: AuthReq, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const item = await Meal.findOne({
    _id: req.params.id,
    userId: req.auth.userId,
  });

  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// PATCH /meals/:id
function dotify(obj: any, prefix = ""): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue; // no escribir undefined
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, dotify(v, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}

export const updateMeal = asyncHandler(async (req: AuthReq, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const patch = UpdateMealDto.parse(req.body);

  // opcional: asegurar exclusión mutua
  if (patch.customItem) {
    patch.recipeId = undefined;
    patch.servings = undefined;
  }
  if (patch.recipeId || patch.servings) {
    patch.customItem = undefined;
  }

  // aplanar a rutas con punto para no machacar subdocs completos
  const $set = dotify(patch);

  try {
    const updated = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ error: "Another meal already exists for that date/slot." });
    }
    throw err;
  }
});

// PUT /meals/:id
export const replaceMeal = asyncHandler(async (req: AuthReq, res) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  const data = ReplaceMealDto.parse(req.body);

  // limpiar la rama excluyente por claridad
  if (data.recipeId) data.customItem = undefined;
  if (data.customItem) {
    data.recipeId = undefined;
    data.servings = undefined;
  }

  const updated = await Meal.findOneAndUpdate(
    { _id: req.params.id, userId: req.auth.userId },
    { ...data },
    { new: true, runValidators: true, overwrite: true }
  );
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
});

// DELETE /meals/:id
export const deleteMeal = asyncHandler(async (req: AuthReq, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const del = await Meal.deleteOne({
    _id: req.params.id,
    userId: req.auth.userId,
  });
  if (!del.deletedCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

// POST /meals/:id/move   { date?, slot? }
const MoveDto = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  slot: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
});
export const moveMeal = asyncHandler(async (req: AuthReq, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  const data = MoveDto.parse(req.body);
  if (!data.date && !data.slot)
    return res.status(400).json({ error: "Nothing to move." });

  try {
    const upd = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!upd) return res.status(404).json({ error: "Not found" });
    res.json(upd);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ error: "Another meal already exists for that date/slot." });
    }
    throw err;
  }
});

// Fallback de Zod para estas rutas (opcional)
export function mealsErrorBoundary(
  err: any,
  _req: Request,
  res: Response,
  next: Function
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ errors: err.flatten() });
  }
  next(err);
}
