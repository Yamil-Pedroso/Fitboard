/* eslint-disable @typescript-eslint/no-explicit-any */
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
  publicId?: string; // <— align with backend
  pose?: PhotoPose;
  lighting?: PhotoLighting;
  notes?: string;
}

export interface IProgressBody {
  bodyFatPct?: number;
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
  spo2_pct?: number;
}

export interface IProgressWellness {
  sleep_hours?: number;
  energy_1to5?: number;
  stress_1to5?: number;
  soreness_1to5?: number;
}

export interface IProgressActivity {
  steps?: number;
  timeTrainedMin?: number;
  vo2max?: number;
  workoutId?: string; // Routine id
  caloriesBurned_est?: number;
}

/** Single reference photo (start/compare) */
export interface ISinglePhoto {
  url: string;
  publicId?: string;
  notes?: string;
  capturedAt?: string;
}

/** ---------- Main document ---------- */
export interface IProgress {
  _id: string;
  userId: string;

  date: string; // YYYY-MM-DD
  timeOfDay: TimeOfDay;
  timezone?: string;

  unitSystem: UnitSystem;
  source: ProgressSource;

  weight_kg?: number;
  waist_cm?: number;

  body?: IProgressBody;
  vitals?: IProgressVitals;
  wellness?: IProgressWellness;
  activity?: IProgressActivity;

  notes?: string;

  photos: IProgressPhoto[]; // posed photos (front/side/back)
  startPhoto?: ISinglePhoto; // reference slots
  comparePhoto?: ISinglePhoto; // reference slots

  tags: string[];

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** ---------- Create / Update payloads ---------- */
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
  startPhoto?: ISinglePhoto;
  comparePhoto?: ISinglePhoto;
  tags?: string[];
};

export type UpdateProgressInput = Partial<CreateProgressInput> & {
  date?: string; // allowed by backend (validated)
};

export type UpsertByDateInput = Partial<Omit<CreateProgressInput, "date">>;

export type AddPhotosInput = {
  photos: IProgressPhoto[];
};

/** ---------- List params & response ---------- */
export interface IListProgressParams {
  page?: number;
  limit?: number;
  /** Backend expects "from" / "to"; keep alias for convenience */
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  startDate?: string; // alias to -> from
  endDate?: string; // alias to -> to
  timeOfDay?: TimeOfDay;
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

/** ---------- Stats response (matches controller) ---------- */
export interface ProgressStatsResponse {
  count: number;
  range: { from: string | null; to: string | null };
  weight: {
    start: number | null;
    end: number | null;
    delta: number | null;
    perWeek: number | null;
  };
  waist: {
    start: number | null;
    end: number | null;
    delta: number | null;
    perWeek: number | null;
  };
}

/** =======================
 *  READ: List / Get
 *  ======================= */
export async function listAllProgress(
  opts?: IListProgressParams
): Promise<ListProgressResponse> {
  const { data } = await axiosInstance.get<ListProgressPayload>("/progress", {
    params: {
      page: opts?.page,
      limit: opts?.limit,
      // map aliases to backend query names
      from: opts?.from ?? opts?.startDate,
      to: opts?.to ?? opts?.endDate,
      sort: opts?.sort,
      tag: opts?.tag,
      timeOfDay: opts?.timeOfDay,
    },
  });

  const hasMore = data.page * data.limit < data.total;
  return { ...data, hasMore };
}

export async function getProgressById(id: string): Promise<IProgress> {
  const { data } = await axiosInstance.get<IProgress>(`/progress/${id}`);
  return data;
}

export async function getProgressByDate(date: string): Promise<IProgress> {
  const { data } = await axiosInstance.get<IProgress>(`/progress/date/${date}`);
  return data;
}

/** =======================
 *  WRITE: Create / Update / Delete
 *  ======================= */
export async function createProgress(
  payload: CreateProgressInput
): Promise<IProgress> {
  const { data } = await axiosInstance.post<IProgress>("/progress", payload);
  return data;
}

export async function upsertProgressByDate(
  date: string,
  payload: UpsertByDateInput
): Promise<IProgress> {
  const { data } = await axiosInstance.put<IProgress>(
    `/progress/${date}`,
    payload
  );
  return data;
}

export async function updateProgress(
  id: string,
  patch: UpdateProgressInput
): Promise<IProgress> {
  const { data } = await axiosInstance.patch<IProgress>(
    `/progress/${id}`,
    patch
  );
  return data;
}

export async function deleteProgress(id: string): Promise<{ ok: boolean }> {
  const { data } = await axiosInstance.delete<{ ok: boolean }>(
    `/progress/${id}`
  );
  return data;
}

/** =======================
 *  STATS
 *  ======================= */
export async function getProgressStats(params?: {
  from?: string;
  to?: string;
}): Promise<ProgressStatsResponse> {
  const { data } = await axiosInstance.get<ProgressStatsResponse>(
    "/progress/stats",
    { params }
  );
  return data;
}

/** =======================
 *  PHOTOS: POSED (front/side/back) — multipart upsert (max 3)
 *  ======================= */
export type PosedPhotoMeta = { lighting?: PhotoLighting; notes?: string };
export type UpsertPosedPhotosInput = {
  id: string;
  files: {
    front?: File | Blob;
    side?: File | Blob;
    back?: File | Blob;
  };
  meta?: {
    front?: PosedPhotoMeta;
    side?: PosedPhotoMeta;
    back?: PosedPhotoMeta;
  };
};

export async function upsertPosedPhotos({
  id,
  files,
  meta,
}: UpsertPosedPhotosInput): Promise<IProgress> {
  const fd = new FormData();

  if (files.front) fd.append("front", files.front);
  if (files.side) fd.append("side", files.side);
  if (files.back) fd.append("back", files.back);

  if (meta?.front?.lighting) fd.append("frontLighting", meta.front.lighting);
  if (meta?.front?.notes) fd.append("frontNotes", meta.front.notes);

  if (meta?.side?.lighting) fd.append("sideLighting", meta.side.lighting);
  if (meta?.side?.notes) fd.append("sideNotes", meta.side.notes);

  if (meta?.back?.lighting) fd.append("backLighting", meta.back.lighting);
  if (meta?.back?.notes) fd.append("backNotes", meta.back.notes);

  const { data } = await axiosInstance.post<IProgress>(
    `/progress/${id}/photos`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/** Remove one posed photo by publicId (preferred) */
export async function removeProgressPhotoByPublicId(
  id: string,
  publicId: string
): Promise<IProgress> {
  const { data } = await axiosInstance.delete<IProgress>(
    `/progress/${id}/photos/${encodeURIComponent(publicId)}`
  );
  return data;
}

/** Remove one posed photo by URL (backend supports URL-encoded http/https) */
export async function removeProgressPhotoByUrl(
  id: string,
  url: string
): Promise<IProgress> {
  const { data } = await axiosInstance.delete<IProgress>(
    `/progress/${id}/photos/${encodeURIComponent(url)}`
  );
  return data;
}

/** =======================
 *  REFERENCE PHOTOS (start/compare)
 *  ======================= */

/** Upload/replace start/compare via multipart (files are optional & independent) */
export async function uploadReferencePhotos(params: {
  id: string;
  start?: File | Blob;
  compare?: File | Blob;
  startNotes?: string;
  startCapturedAt?: string; // ISO string
  compareNotes?: string;
  compareCapturedAt?: string; // ISO string
}): Promise<IProgress> {
  const fd = new FormData();
  if (params.start) fd.append("start", params.start);
  if (params.compare) fd.append("compare", params.compare);
  if (params.startNotes) fd.append("startNotes", params.startNotes);
  if (params.startCapturedAt)
    fd.append("startCapturedAt", params.startCapturedAt);
  if (params.compareNotes) fd.append("compareNotes", params.compareNotes);
  if (params.compareCapturedAt)
    fd.append("compareCapturedAt", params.compareCapturedAt);

  const { data } = await axiosInstance.post<IProgress>(
    `/progress/${params.id}/reference-photos`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/** Set/clear start/compare by JSON (pass null to clear) */
export async function setReferencePhotosByJson(
  id: string,
  payload: {
    startPhoto?: ISinglePhoto | null;
    comparePhoto?: ISinglePhoto | null;
  }
): Promise<IProgress> {
  const { data } = await axiosInstance.patch<IProgress>(
    `/progress/${id}/reference-photos`,
    payload
  );
  return data;
}

/** Remove exactly one reference slot ("start" | "compare") */
export async function removeReferencePhoto(
  id: string,
  which: "start" | "compare"
): Promise<IProgress> {
  const { data } = await axiosInstance.delete<IProgress>(
    `/progress/${id}/reference-photos/${which}`
  );
  return data;
}
