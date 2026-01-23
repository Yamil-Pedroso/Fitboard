import { Schema, model, Types, HydratedDocument } from "mongoose";
import { z } from "zod";
import { CustomItems, MealSlot } from "../types/domain";

export interface IMeal {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string;
  slot: MealSlot;
  recipeId?: Types.ObjectId;
  servings?: number;
  customItem?: CustomItems;
  createdAt: Date;
  updatedAt: Date;
}
export type MealDoc = HydratedDocument<IMeal>;

const CustomItemSchema = new Schema<CustomItems>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, enum: ["g", "ml", "unit"], required: true },
    nutritionBasis: {
      amount: { type: Number, required: true },
      unit: { type: String, enum: ["g", "ml", "unit"], required: true },
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
  { _id: false },
);

const MealSchema = new Schema<IMeal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    slot: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    recipeId: { type: Types.ObjectId, ref: "Recipe" },
    servings: { type: Number, min: 0.1 },
    customItem: { type: CustomItemSchema },
  },
  { timestamps: true },
);

MealSchema.index({ userId: 1, date: 1, slot: 1 }, { unique: true });

MealSchema.pre("validate", function (next) {
  const hasRecipe = !!this.recipeId;
  const hasCustom = !!this.customItem;
  if (hasRecipe === hasCustom)
    return next(
      new Error(
        "Use either recipe + servings or customItem (mutually exclusive).",
      ),
    );
  if (hasRecipe && !this.servings)
    return next(new Error("Servings is required when recipeId is provided."));

  next();
});

export const Meal = model<IMeal>("Meal", MealSchema);

const CustomItemDto = z.object({
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

export const CreateMealDto = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slot: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    recipeId: z.string().optional(),
    servings: z.number().positive().optional(),
    customItem: CustomItemDto.optional(),
  })
  .refine(
    (d) =>
      (d.recipeId && d.servings && !d.customItem) ||
      (!d.recipeId && !!d.customItem),
    {
      message: "Must be recipe + servings or customItem (mutually exclusive).",
    },
  );

const CustomItemPatchDto = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  unit: z.enum(["g", "ml", "unit"]).optional(),
  nutritionBasis: z
    .object({
      amount: z.number().positive().optional(),
      unit: z.enum(["g", "ml", "unit"]).optional(),
    })
    .optional(),
  macrosPerBasis: z
    .object({
      kcal: z.number().nonnegative().optional(),
      protein: z.number().nonnegative().optional(),
      carbohydrate: z.number().nonnegative().optional(),
      fat: z.number().nonnegative().optional(),
    })
    .optional(),
  gramsPerUnit: z.number().positive().optional(),
  densityGPerMl: z.number().positive().optional(),
});

export const UpdateMealDto = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  slot: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  recipeId: z.string().optional(),
  servings: z.number().positive().optional(),
  customItem: CustomItemPatchDto.optional(),
});
