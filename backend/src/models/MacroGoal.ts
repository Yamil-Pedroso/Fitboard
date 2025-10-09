import { Schema, model, Types, HydratedDocument } from "mongoose";
import { z } from "zod";

export interface IMacroGoal {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  kcal: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  effectiveFrom: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}
export type MacroGoalDoc = HydratedDocument<IMacroGoal>;

const MacroGoalSchema = new Schema<IMacroGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kcal: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrate: { type: Number, required: true },
    fat: { type: Number, required: true },
    effectiveFrom: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
  },
  { timestamps: true }
);

MacroGoalSchema.index({ userId: 1, effectiveFrom: 1 });

export const MacroGoal = model<IMacroGoal>("MacroGoal", MacroGoalSchema);

/* DTOs */
export const CreateMacroGoalDto = z.object({
  kcal: z.number().int().positive(),
  protein: z.number().int().nonnegative(),
  carbohydrate: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const UpdateMacroGoalDto = CreateMacroGoalDto.partial();
