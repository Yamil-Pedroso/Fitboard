/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  type UseQueryResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  listAllRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  replaceRoutine,
  deleteRoutine,
  duplicateRoutine,
  archiveRoutine,
  unarchiveRoutine,
  markRoutinePerformed,
  type CreateRoutineInput,
  type UpdateRoutineInput,
  type ListRoutinesResponse,
  ReplaceRoutineInput,
} from "@/services/routineService";
import { toast } from "sonner";

type RoutinesKey = readonly ["routines", "list", "all"];

export function useRoutines() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  }: UseQueryResult<ListRoutinesResponse, unknown> = useQuery<
    ListRoutinesResponse,
    unknown,
    ListRoutinesResponse,
    RoutinesKey
  >({
    queryKey: ["routines", "list", "all"] as const,
    queryFn: () => listAllRoutines(), // no params
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    routines: data?.items ?? [],
    page: data?.page ?? 1,
    limit: data?.limit ?? data?.items?.length ?? 0,
    total: data?.total ?? data?.items?.length ?? 0,
    hasMore: data?.hasMore ?? false,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

export function useRoutine(routineId: string) {
  return useQuery({
    queryKey: ["routine", routineId] as const,
    queryFn: () => getRoutineById(routineId),
    enabled: !!routineId,
  });
}

export function useCreateRoutine() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: CreateRoutineInput) => createRoutine(input),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["routines", created.createdAt] });
      toast.success("Routine created successfully!");
      navigate({ to: "/routines", replace: true });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.error || err?.message || "Could not create routine";
      toast.error(msg);
    },
  });
}

export function useUpdateRoutine() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (vars: { routineId: string; input: UpdateRoutineInput }) =>
      updateRoutine(vars.routineId, vars.input),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({
        queryKey: ["routines", updated._id, updated.createdAt],
      });
      toast.success("Routine updated successfully!");
      navigate({ to: "/routines", replace: true });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.error || err?.message || "Could not update routine";
      toast.error(msg);
    },
  });
}

export function useReplaceRoutine() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (vars: { routineId: string; input: ReplaceRoutineInput }) =>
      replaceRoutine(vars.routineId, vars.input),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({
        queryKey: ["routines", updated._id, updated.createdAt],
      });
      toast.success("Routine replaced successfully!");
      navigate({ to: "/routines", replace: true });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.error || err?.message || "Could not replace routine";
      toast.error(msg);
    },
  });
}

export function useDeleteRoutine() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoutine(id),
    onSuccess: () => {
      toast.success("Routine deleted!");
      qc.invalidateQueries({ queryKey: ["routines"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Coul not delete routine");
    },
  });
}

// Extra actions
export function useDuplicateRoutine() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { routineId: string; name: string }) =>
      duplicateRoutine(vars.routineId, vars.name),
    onSuccess: (duplicated) => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["routines", duplicated.createdAt] });
      toast.success("Routine duplicated successfully!");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.error || err?.message || "Could not duplicate routine";
      toast.error(msg);
    },
  });
}
export function useArchiveRoutine() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveRoutine(id),
    onSuccess: (archived) => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["routines", archived.createdAt] });
      toast.success("Routine archived successfully!");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.error || err?.message || "Could not archive routine";
      toast.error(msg);
    },
  });
}
export function useUnarchiveRoutine() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unarchiveRoutine(id),
    onSuccess: (unarchived) => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["routines", unarchived.createdAt] });
      toast.success("Routine unarchived successfully!");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.error || err?.message || "Could not unarchive routine";
      toast.error(msg);
    },
  });
}
export function useMarkPerformedRoutine() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { routineId: string; date: string }) =>
      markRoutinePerformed(vars.routineId, vars.date),
    onSuccess: (markPerformed) => {
      qc.invalidateQueries({ queryKey: ["routines"] });
      qc.invalidateQueries({ queryKey: ["routines", markPerformed.createdAt] });
      toast.success("Routine mark performed successfully!");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.error ||
        err?.message ||
        "Could not mark performed routine";
      toast.error(msg);
    },
  });
}
