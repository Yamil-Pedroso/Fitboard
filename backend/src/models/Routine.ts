import { Schema, model, Types, HydratedDocument } from "mongoose";
import { z } from "zod";

export interface ExerciseItem {
  name: string;
  sets: number;
  reps: string; // "5" | "8-12" | "AMRAP" | etc.
  restSec: number; // resting between series in secs
  position: number; // order inside the block
  loadKg?: number;
  rir?: number;
  tempo?: string;
  notes?: string;
}

export interface RoutineBlock {
  title?: string; // "Lower", "Push", "Core", ...
  position: number; // order of the block inside the routine
  exercises: ExerciseItem[];
}

export interface IRoutine {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  blocks: RoutineBlock[];
  createdAt: Date;
  updatedAt: Date;
}
export type RoutineDoc = HydratedDocument<IRoutine>;

const ExerciseItemSchema = new Schema<ExerciseItem>(
  {
    name: { type: String, required: true },
    sets: { type: Number, min: 1, required: true },
    reps: { type: String, required: true },
    restSec: { type: Number, min: 0, default: 90 },
    position: { type: Number, min: 1, required: true },
    loadKg: Number,
    rir: Number,
    tempo: String,
    notes: String,
  },
  { _id: false }
);

const RoutineBlockSchema = new Schema<RoutineBlock>(
  {
    title: String,
    position: { type: Number, min: 1, required: true },
    exercises: { type: [ExerciseItemSchema], default: [] },
  },
  { _id: false }
);

const RoutineSchema = new Schema<IRoutine>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    blocks: { type: [RoutineBlockSchema], default: [] },
  },
  { timestamps: true }
);

export const Routine = model<IRoutine>("Routine", RoutineSchema);

/* DTOs */
const ExerciseItemDto = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1),
  reps: z.string().min(1),
  restSec: z.number().int().min(0).default(90),
  position: z.number().int().min(1),
  loadKg: z.number().positive().optional(),
  rir: z.number().min(0).max(10).optional(),
  tempo: z.string().optional(),
  notes: z.string().optional(),
});

const RoutineBlockDto = z.object({
  title: z.string().optional(),
  position: z.number().int().min(1),
  exercises: z.array(ExerciseItemDto).default([]),
});

export const CreateRoutineDto = z.object({
  name: z.string().min(2),
  blocks: z.array(RoutineBlockDto).default([]),
});
export const UpdateRoutineDto = CreateRoutineDto.partial();
