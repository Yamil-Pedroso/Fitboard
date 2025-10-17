import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { asyncHandler } from "../middlewares/asyncHandler";
import { Recipe } from "../models/Recipe";
import {
  CreateRecipeDto as BaseCreateRecipeDto,
  UpdateRecipeDto as BaseUpdateRecipeDto,
} from "../models/Recipe";

type AuthReq = Request & { auth?: { userId: string } };

// Reutilizamos los DTO del modelo
const CreateRecipeDto = BaseCreateRecipeDto;
const UpdateRecipeDto = BaseUpdateRecipeDto; // PATCH parcial
const ReplaceRecipeDto = CreateRecipeDto; // PUT completo

/** ===== Listar con filtros/paginación ===== */
const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(), // búsqueda por nombre
  category: z.string().optional(), // id de categoría
  sort: z
    .enum(["name", "-name", "createdAt", "-createdAt"])
    .default("-createdAt"),
});

export const listRecipes = asyncHandler(async (req: AuthReq, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const { page, limit, q, category, sort } = ListQuery.parse(req.query);
  const skip = (page - 1) * limit;

  const filter: any = { userId: req.auth.userId };
  if (q) filter.name = { $regex: q, $options: "i" };
  if (category) filter.categoryIds = category;

  const [items, total] = await Promise.all([
    Recipe.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Recipe.countDocuments(filter),
  ]);

  res.json({ page, limit, total, items });
});

/** ===== Obtener una ===== */
export const getRecipe = asyncHandler(async (req: AuthReq, res: Response) => {
  if (!req.auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const item = await Recipe.findOne({
    _id: req.params.id,
    userId: req.auth.userId,
  }).lean();

  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

/** ===== Crear ===== */
export const createRecipe = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const data = CreateRecipeDto.parse(req.body);

    try {
      const doc = await Recipe.create({ ...data, userId: req.auth.userId });
      res.status(201).json(doc);
    } catch (err: any) {
      // índice único (userId + name)
      if (err?.code === 11000) {
        return res
          .status(409)
          .json({ error: "A recipe with that name already exists." });
      }
      throw err;
    }
  }
);

/** ===== Actualizar parcial (PATCH) ===== */
export const updateRecipe = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const patch = UpdateRecipeDto.parse(req.body);

    try {
      const updated = await Recipe.findOneAndUpdate(
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
          .json({ error: "A recipe with that name already exists." });
      }
      throw err;
    }
  }
);

/** ===== Reemplazo completo (PUT) ===== */
export const replaceRecipe = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });
    const data = ReplaceRecipeDto.parse(req.body);

    const updated = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { ...data, userId: req.auth.userId },
      { new: true, runValidators: true, overwrite: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  }
);

/** ===== Eliminar ===== */
export const deleteRecipe = asyncHandler(
  async (req: AuthReq, res: Response) => {
    if (!req.auth?.userId)
      return res.status(401).json({ error: "Unauthorized" });

    const del = await Recipe.deleteOne({
      _id: req.params.id,
      userId: req.auth.userId,
    });
    if (!del.deletedCount) return res.status(404).json({ error: "Not found" });

    // (Opcional) también podrías limpiar Meals que referencian esta recipeId para este user
    res.json({ ok: true });
  }
);

/** ===== Manejo de Zod (opcional, como en Meals) ===== */
export function recipesErrorBoundary(
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
