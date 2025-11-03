import axiosInstance from "@/api/axiosConfig";

/** ---------- Scalar & enum-like types (match backend) ---------- */
export type TimeOfDay = "morning" | "evening" | "other";
export type UnitSystem = "metric" | "imperial";
export type ProgressSource = "manual" | "device" | "import";
export type PhotoPose = "front" | "side" | "back";
export type PhotoLighting = "natural" | "artificial" | "unknown";
export type BodyFatMethod = "bmi" | "impedance" | "caliper" | "scan";

/** ---------- Embedded objects ---------- */
export interface IProgressPhoto {
  url: string;
  pose?: PhotoPose;
  lighting?: PhotoLighting;
  notes?: string;
}

export interface IProgressBody {
  bodyFatPct?: number; // 1..75
  bodyFatMethod?: BodyFatMethod;
  chest_cm?: number;
  hip_cm?: number;
  thigh_cm?: number;
  arm_cm?: number;
  neck_cm?: number;
  estimatedLeanMass_kg?: number;
}

export interface IProgressVitals {
  rhr_bpm?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  spo2_pct?: number; // 50..100
}

export interface IProgressWellness {
  sleep_hours?: number; // 0..24
  energy_1to5?: number; // 1..5
  stress_1to5?: number; // 1..5
  soreness_1to5?: number; // 1..5
}

export interface IProgressActivity {
  steps?: number;
  timeTrainedMin?: number;
  vo2max?: number;
  workoutId?: string; // Routine id (string on the client)
  caloriesBurned_est?: number;
}

/** ---------- Main document ---------- */
export interface IProgress {
  _id: string; // ObjectId as string on the client
  userId: string;

  date: string; // YYYY-MM-DD
  timeOfDay: TimeOfDay; // default: "other"
  timezone?: string; // e.g. "Europe/Zurich"

  unitSystem: UnitSystem; // default: "metric"
  source: ProgressSource; // default: "manual"

  weight_kg?: number;
  waist_cm?: number;

  body?: IProgressBody;
  vitals?: IProgressVitals;
  wellness?: IProgressWellness;
  activity?: IProgressActivity;

  notes?: string;

  photos: IProgressPhoto[]; // default: []
  tags: string[]; // default: []

  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deletedAt?: string | null; // soft delete
}

/** ---------- Create / Update payloads ---------- */
/** Matches CreateProgressDto on the backend */
export type CreateProgressInput = {
  date: string; // YYYY-MM-DD
  timeOfDay?: TimeOfDay;
  timezone?: string;
  unitSystem?: UnitSystem;
  source?: ProgressSource;

  weight_kg?: number;
  waist_cm?: number;

  body?: IProgressBody;
  vitals?: IProgressVitals;
  wellness?: IProgressWellness;
  activity?: IProgressActivity;

  notes?: string;
  photos?: IProgressPhoto[];
  tags?: string[];
};

/** PATCH by id (partial; mirrors UpdateProgressDto.partial()) */
export type UpdateProgressInput = Partial<CreateProgressInput> & {
  /** Optionally allow changing the date via PATCH (backend validates ISO) */
  date?: string;
};

/** PUT upsert by date (body is partial Create without date param) */
export type UpsertByDateInput = Partial<Omit<CreateProgressInput, "date">>;

/** Add/replace multiple photos helper */
export type AddPhotosInput = {
  photos: IProgressPhoto[];
};

/** ---------- List params & response (generic, mirrors your style) ---------- */
export interface IListProgressParams {
  page?: number;
  limit?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  timeOfDay?: TimeOfDay;
  /** e.g. "date", "-date", "createdAt", "-createdAt" */
  sort?: "date" | "-date" | "createdAt" | "-createdAt";
  tag?: string;
}

export type ListProgressPayload = {
  page: number;
  limit: number;
  total: number;
  items: IProgress[];
};

export type ListProgressResponse = ListProgressPayload & { hasMore: boolean };

/** ---------- (Optional) Stats shape (kept flexible; all optional) ---------- */
export interface IProgressStats {
  count?: number;
  earliestDate?: string;
  latestDate?: string;
  avgWeight_kg?: number;
  avgWaist_cm?: number;
  minWeight_kg?: number;
  maxWeight_kg?: number;
  minWaist_cm?: number;
  maxWaist_cm?: number;
  streakDays?: number;
}

export async function listAllProgress(
  opts?: IListProgressParams
): Promise<ListProgressResponse> {
  const { data } = await axiosInstance.get<ListProgressPayload>("/progress", {
    params: {
      page: opts?.page,
      limit: opts?.limit,
      startDate: opts?.startDate,
      endDate: opts?.endDate,
      timeOfDay: opts?.timeOfDay,
      sort: opts?.sort, // "date" | "-date" | ...
      tag: opts?.tag,
    },
  });

  const hasMore = data.page * data.limit < data.total;
  return { ...data, hasMore };
}
