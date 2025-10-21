import { Schema, model, Types, HydratedDocument } from "mongoose";
import { z } from "zod";
import { Ingredient } from "@/types/domain";

export interface IRecipe {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  date: string;
  servings: number;
  ingredients: Ingredient[];
  categoryIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type RecipeDoc = HydratedDocument<IRecipe>;

const IngredientSchema = new Schema<Ingredient>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, enum: ["g", "ml", "unit"], required: true },
    nutritionBasis: {
      amount: { type: Number, required: true },
      unit: { type: String, enum: ["g", "ml", "unit"], require: true },
    },
    macrosPerBasis: {
      kcal: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbohydrate: { type: Number, required: true },
      fat: { type: Number, required: true },
    },
    gramsPerUnit: Number,
    densityGPerMl: Number,
  },
  { _id: false }
);

const RecipeSchema = new Schema<IRecipe>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    servings: { type: Number, default: 1, min: 1 },
    ingredients: { type: [IngredientSchema], default: [] },
    categoryIds: { type: [Types.ObjectId], ref: "Category", default: [] },
  },
  { timestamps: true }
);

RecipeSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Recipe = model<IRecipe>("Recipe", RecipeSchema);

/* DTOs */
const IngredientDto = z.object({
  name: z.string().min(1),

  amount: z.number().positive(),
  unit: z.enum(["g", "ml", "unit"]),
  nutritionBasis: z.object({
    amount: z.number().positive(),
    unit: z.enum(["g", "ml", "unit"]),
  }),
  macrosPerBasis: z.object({
    kcal: z.number().nonnegative(),
    protein: z.number().nonnegative(),
    carbohydrate: z.number().nonnegative(),
    fat: z.number().nonnegative(),
  }),
  gramsPerUnit: z.number().positive().optional(),
  densityGPerMl: z.number().positive().optional(),
});

export const CreateRecipeDto = z.object({
  name: z.string().min(2),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  servings: z.number().int().positive().default(1),
  ingredients: z.array(IngredientDto).default([]),
  categoryIds: z.array(z.string()).default([]),
});
export const UpdateRecipeDto = CreateRecipeDto.partial();
