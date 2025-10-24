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
  videoUrl?: string;
  cues?: string[];
}

export interface RoutineBlock {
  title?: string; // "Lower", "Push", "Core", ...
  position: number;
  exercises: ExerciseItem[];
  exerciseType?: "strength" | "hypertrophy" | "conditioning" | "mobility";
  rounds?: number;
  restBetweenExercisesSec?: number;
  timer?: {
    mode: "countdown" | "emom" | "amrap" | "tabata";
    seconds: number;
  };
}

export interface IRoutine {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  blocks: RoutineBlock[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isTemplate: boolean;
  isArchived: boolean;
  estimatedDurationMin?: number;
  lastPerformedAt?: Date;
  timesPerformed: number;
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
    videoUrl: String,
    cues: { type: [String], default: [] },
  },
  { _id: false }
);

const RoutineBlockSchema = new Schema<RoutineBlock>(
  {
    title: String,
    position: { type: Number, min: 1, required: true },
    exercises: { type: [ExerciseItemSchema], default: [] },
    exerciseType: {
      type: String,
      enum: ["strength", "hypertrophy", "conditioning", "mobility"],
    },
    rounds: { type: Number, min: 1 },
    restBetweenExercisesSec: { type: Number, min: 0 },
    timer: {
      mode: { type: String, enum: ["countdown", "emom", "amrap", "tabata"] },
      seconds: Number,
    },
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
    tags: { type: [String], default: [] },
    isTemplate: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    estimatedDurationMin: Number,
    lastPerformedAt: Date,
    timesPerformed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

RoutineSchema.index({ userId: 1, name: 1 }, { unique: true });

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
  videoUrl: z.url().optional(),
  cues: z.array(z.string()).default([]),
});

const RoutineBlockDto = z.object({
  title: z.string().optional(),
  position: z.number().int().min(1),
  exercises: z.array(ExerciseItemDto).default([]),
  exerciseType: z
    .enum(["strength", "hypertrophy", "conditioning", "mobility"])
    .optional(),
  rounds: z.number().int().min(1).optional(),
  restBetweenExercisesSec: z.number().int().min(0).optional(),
  timer: z
    .object({
      mode: z.enum(["countdown", "emom", "amrap", "tabata"]),
      seconds: z.number().int().min(1),
    })
    .optional(),
});

export const CreateRoutineDto = z.object({
  name: z.string().min(2),
  blocks: z.array(RoutineBlockDto).default([]),
  tags: z.array(z.string()).optional(),
  isTemplate: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  estimatedDurationMin: z.number().int().min(1).optional(),
  lastPerformedAt: z.date().optional(),
  timesPerformed: z.number().int().min(0).default(0),
});
export const UpdateRoutineDto = CreateRoutineDto.partial();
