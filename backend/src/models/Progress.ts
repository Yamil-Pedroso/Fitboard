import { Schema, model, Types, HydratedDocument } from "mongoose";
import { z } from "zod";

export interface IProgress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  weight_kg?: number;
  waist_cm?: number;
  notes?: string;
  photos?: string[]; // URLs/ids
  createdAt: Date;
  updatedAt: Date;
}
export type ProgressDoc = HydratedDocument<IProgress>;

const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    weight_kg: Number,
    waist_cm: Number,
    notes: String,
    photos: { type: [String], default: [] },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Progress = model<IProgress>("Progress", ProgressSchema);

/* DTOs */
export const CreateProgressDto = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weight_kg: z.number().positive().optional(),
  waist_cm: z.number().positive().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
});
export const UpdateProgressDto = CreateProgressDto.partial();
