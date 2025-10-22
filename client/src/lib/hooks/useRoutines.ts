// hooks/useRoutines.ts
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  listAllRoutines,
  type ListRoutinesResponse,
} from "@/services/routineService";

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
