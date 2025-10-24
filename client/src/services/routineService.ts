/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/api/axiosConfig";

/** ----- Types that mirror your backend model ----- */
export type ExerciseType =
  | "strength"
  | "hypertrophy"
  | "conditioning"
  | "mobility";
export type Timer = { mode: "countdown" | "emom"; seconds: number };

export interface IRoutineExercise {
  name: string;
  sets: number;
  reps: string; // "8-10" | "10/side" | "60 sec"
  restSec: number;
  position: number;
  loadKg?: number;
  rir?: number;
  tempo?: string;
  notes?: string;
  videoUrl?: string;
  cues?: string[];
}

export interface IRoutineBlock {
  title?: string;
  position: number;
  exercises: IRoutineExercise[];
  exerciseType?: ExerciseType;
  rounds?: number;
  restBetweenExercisesSec?: number;
  timer?: Timer | null;
}

export interface IRoutine {
  _id: string;
  userId: string;
  name: string;
  blocks: IRoutineBlock[];
  tags: string[];
  isTemplate: boolean;
  isArchived: boolean;
  estimatedDurationMin?: number;
  lastPerformedAt?: string | null; // ISO string or null
  timesPerformed: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type CreateRoutineInput = {
  name: string;
  blocks: IRoutineBlock[];
  tags?: string[];
  isTemplate?: boolean;
  isArchived?: boolean;
  estimatedDurationMin?: number;
};

// PATCH parcial (solo campos editables)
export type UpdateRoutineInput = Partial<Omit<CreateRoutineInput, never>>;

// PUT reemplazo completo (mismo shape que crear)
export type ReplaceRoutineInput = CreateRoutineInput;

/** ----- List params & response ----- */
export interface IListRoutinesParams {
  page?: number;
  limit?: number;
  q?: string;
  tag?: string;
  templatesOnly?: boolean; // maps to ?template=true
  includeArchived?: boolean; // maps to ?archived=true
  sort?:
    | "name"
    | "-name"
    | "createdAt"
    | "-createdAt"
    | "lastPerformedAt"
    | "-lastPerformedAt"
    | "timesPerformed"
    | "-timesPerformed";
}

export type ListRoutinesPayload = {
  page: number;
  limit: number;
  total: number;
  items: IRoutine[];
};

export type ListRoutinesResponse = ListRoutinesPayload & { hasMore: boolean };

/** ----- Service: list all routines (paginated) ----- */
export async function listAllRoutines(opts?: {
  includeArchived?: boolean;
}): Promise<ListRoutinesResponse> {
  const { data } = await axiosInstance.get<ListRoutinesPayload>("/routines", {
    params: {
      includeArchived: opts?.includeArchived ? true : undefined,
    },
  });
  const hasMore = data.page * data.limit < data.total;
  return { ...data, hasMore };
}
/** ----- Service: fetch a routine ----- */
export async function getRoutineById(routineId: string): Promise<IRoutine> {
  const { data } = await axiosInstance.get(`/routines/${routineId}`);
  return data;
}

/** ----- Service: create a rountine ----- */
export async function createRoutine(
  input: CreateRoutineInput
): Promise<IRoutine> {
  const { data } = await axiosInstance.post<IRoutine>("/routines", input);
  return data;
}

/** ----- Service: update a rountine ----- */
export async function updateRoutine(
  routineId: string,
  input: UpdateRoutineInput
): Promise<IRoutine> {
  const { data } = await axiosInstance.patch<IRoutine>(
    `/routines/${routineId}`,
    input
  );
  return data;
}
/** ----- Service: replace a rountine ----- */
export async function replaceRoutine(
  routineId: string,
  input: ReplaceRoutineInput
): Promise<IRoutine> {
  const { data } = await axiosInstance.put<IRoutine>(
    `/routines/${routineId}`,
    input
  );
  return data;
}

/** ----- Service: delete a rountine ----- */
export async function deleteRoutine(routineId: string): Promise<void> {
  await axiosInstance.delete(`/routines/${routineId}`);
}

/** ----- Extra actions ----- */
export async function duplicateRoutine(
  routineId: string,
  name: string
): Promise<IRoutine> {
  const { data } = await axiosInstance.post<IRoutine>(
    `/routines/${routineId}/duplicate`,
    null,
    { params: name ? { name } : undefined }
  );
  return data;
}

export async function archiveRoutine(routineId: string): Promise<IRoutine> {
  const { data } = await axiosInstance.post<IRoutine>(
    `/routines/${routineId}/archive`
  );
  return data;
}

export async function unarchiveRoutine(routineId: string): Promise<IRoutine> {
  const { data } = await axiosInstance.post<IRoutine>(
    `/routines/${routineId}/unarchive`
  );
  return data;
}

export async function markRoutinePerformed(
  routineId: string,
  date?: string
): Promise<IRoutine> {
  const { data } = await axiosInstance.post<IRoutine>(
    `/routines/${routineId}/mark-performed`,
    { date }
  );
  return data;
}
