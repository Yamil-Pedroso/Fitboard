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
    | "updatedAt"
    | "-updatedAt";
}

export type ListRoutinesResponse = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  items: IRoutine[];
};

/** ----- Service: list all routines (paginated) ----- */
export async function listAllRoutines(): Promise<ListRoutinesResponse> {
  const { data } = await axiosInstance.get<ListRoutinesResponse>("/routines");
  return data;
}
