import { Schema, model, Types, HydratedDocument } from "mongoose";
import { z } from "zod";

/* ---------- Types e interfaces ---------- */
export type TimeOfDay = "morning" | "evening" | "other";
export type UnitSystem = "metric" | "imperial";
export type ProgressSource = "manual" | "device" | "import";
export type PhotoPose = "front" | "side" | "back";
export type PhotoLighting = "natural" | "artificial" | "unknown";

export interface IProgress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  date: string; // YYYY-MM-DD
  timeOfDay: TimeOfDay; // default: "other"
  timezone?: string; // e.g. "Europe/Zurich"

  unitSystem: UnitSystem; // default: "metric"
  source: ProgressSource; // default: "manual"

  weight_kg?: number;
  waist_cm?: number;

  body?: {
    bodyFatPct?: number; // 1..75
    bodyFatMethod?: "bmi" | "impedance" | "caliper" | "scan";
    chest_cm?: number;
    hip_cm?: number;
    thigh_cm?: number;
    arm_cm?: number;
    neck_cm?: number;
    estimatedLeanMass_kg?: number;
  };

  vitals?: {
    rhr_bpm?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    spo2_pct?: number; // 50..100
  };

  wellness?: {
    sleep_hours?: number; // 0..24
    energy_1to5?: number; // 1..5
    stress_1to5?: number; // 1..5
    soreness_1to5?: number; // 1..5
  };

  activity?: {
    steps?: number;
    timeTrainedMin?: number;
    vo2max?: number;
    workoutId?: Types.ObjectId;
    caloriesBurned_est?: number;
  };

  notes?: string;

  photos: {
    url: string;
    pose?: PhotoPose;
    lighting?: PhotoLighting;
    notes?: string;
  }[];

  tags: string[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null; // soft delete
}
export type ProgressDoc = HydratedDocument<IProgress>;

/* ---------- Sub-esquemas ---------- */
const PhotoSchema = new Schema<IProgress["photos"][number]>(
  {
    url: { type: String, required: true },
    pose: { type: String, enum: ["front", "side", "back"] },
    lighting: {
      type: String,
      enum: ["natural", "artificial", "unknown"],
      default: "unknown",
    },
    notes: String,
  },
  { _id: false }
);

const BodySchema = new Schema<IProgress["body"]>(
  {
    bodyFatPct: { type: Number, min: 1, max: 75 },
    bodyFatMethod: {
      type: String,
      enum: ["bmi", "impedance", "caliper", "scan"],
    },
    chest_cm: { type: Number, min: 0 },
    hip_cm: { type: Number, min: 0 },
    thigh_cm: { type: Number, min: 0 },
    arm_cm: { type: Number, min: 0 },
    neck_cm: { type: Number, min: 0 },
    estimatedLeanMass_kg: { type: Number, min: 0 },
  },
  { _id: false }
);

const VitalsSchema = new Schema<IProgress["vitals"]>(
  {
    rhr_bpm: { type: Number, min: 0 },
    bp_systolic: { type: Number, min: 0 },
    bp_diastolic: { type: Number, min: 0 },
    spo2_pct: { type: Number, min: 50, max: 100 },
  },
  { _id: false }
);

const WellnessSchema = new Schema<IProgress["wellness"]>(
  {
    sleep_hours: { type: Number, min: 0, max: 24 },
    energy_1to5: { type: Number, min: 1, max: 5 },
    stress_1to5: { type: Number, min: 1, max: 5 },
    soreness_1to5: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const ActivitySchema = new Schema<IProgress["activity"]>(
  {
    steps: { type: Number, min: 0 },
    timeTrainedMin: { type: Number, min: 0 },
    vo2max: { type: Number, min: 0 },
    workoutId: { type: Schema.Types.ObjectId, ref: "Routine" },
    caloriesBurned_est: { type: Number, min: 0 },
  },
  { _id: false }
);

/* ---------- Principal schema and model ---------- */
const ProgressSchema = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    timeOfDay: {
      type: String,
      enum: ["morning", "evening", "other"],
      default: "other",
    },
    timezone: String,

    unitSystem: {
      type: String,
      enum: ["metric", "imperial"],
      default: "metric",
    },
    source: {
      type: String,
      enum: ["manual", "device", "import"],
      default: "manual",
    },

    weight_kg: { type: Number, min: 0 },
    waist_cm: { type: Number, min: 0 },

    body: { type: BodySchema, default: undefined },
    vitals: { type: VitalsSchema, default: undefined },
    wellness: { type: WellnessSchema, default: undefined },
    activity: { type: ActivitySchema, default: undefined },

    notes: String,

    photos: { type: [PhotoSchema], default: [] },
    tags: { type: [String], default: [] },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

/* Indexes:
  - Unique on (userId, date, timeOfDay) when NOT soft-deleted
  - Recent entries per user
*/
ProgressSchema.index(
  { userId: 1, date: 1, timeOfDay: 1 },
  { unique: true, partialFilterExpression: { deletedAt: { $eq: null } } }
);
ProgressSchema.index({ userId: 1, createdAt: -1 });

export const Progress = model<IProgress>("Progress", ProgressSchema);

/* ---------- DTOs (zod) ---------- */
const PhotoMeta = z.object({
  url: z.string().url(),
  pose: z.enum(["front", "side", "back"]).optional(),
  lighting: z.enum(["natural", "artificial", "unknown"]).optional(),
  notes: z.string().optional(),
});

const BodyDto = z
  .object({
    bodyFatPct: z.number().min(1).max(75).optional(),
    bodyFatMethod: z.enum(["bmi", "impedance", "caliper", "scan"]).optional(),
    chest_cm: z.number().positive().optional(),
    hip_cm: z.number().positive().optional(),
    thigh_cm: z.number().positive().optional(),
    arm_cm: z.number().positive().optional(),
    neck_cm: z.number().positive().optional(),
    estimatedLeanMass_kg: z.number().positive().optional(),
  })
  .partial();

const VitalsDto = z
  .object({
    rhr_bpm: z.number().positive().optional(),
    bp_systolic: z.number().positive().optional(),
    bp_diastolic: z.number().positive().optional(),
    spo2_pct: z.number().min(50).max(100).optional(),
  })
  .partial();

const WellnessDto = z
  .object({
    sleep_hours: z.number().min(0).max(24).optional(),
    energy_1to5: z.number().int().min(1).max(5).optional(),
    stress_1to5: z.number().int().min(1).max(5).optional(),
    soreness_1to5: z.number().int().min(1).max(5).optional(),
  })
  .partial();

const ActivityDto = z
  .object({
    steps: z.number().int().min(0).optional(),
    timeTrainedMin: z.number().int().min(0).optional(),
    vo2max: z.number().min(0).optional(),
    workoutId: z.string().optional(),
    caloriesBurned_est: z.number().int().min(0).optional(),
  })
  .partial();

export const CreateProgressDto = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeOfDay: z.enum(["morning", "evening", "other"]).optional(),
  timezone: z.string().optional(),
  unitSystem: z.enum(["metric", "imperial"]).optional(),
  source: z.enum(["manual", "device", "import"]).optional(),

  weight_kg: z.number().positive().optional(),
  waist_cm: z.number().positive().optional(),

  body: BodyDto.optional(),
  vitals: VitalsDto.optional(),
  wellness: WellnessDto.optional(),
  activity: ActivityDto.optional(),

  notes: z.string().optional(),
  photos: z.array(PhotoMeta).optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateProgressDto = CreateProgressDto.partial();
