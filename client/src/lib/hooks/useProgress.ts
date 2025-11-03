/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  listAllProgress,
  type IListProgressParams,
  type ListProgressResponse,
} from "@/services/progressService";

type ProgressKey = readonly ["progress", "list", IListProgressParams?];

export function useProgress(opts: IListProgressParams = {}) {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  }: UseQueryResult<ListProgressResponse, unknown> = useQuery<
    ListProgressResponse,
    unknown,
    ListProgressResponse,
    ProgressKey
  >({
    queryKey: ["progress", "list", opts] as const,
    queryFn: () => listAllProgress(opts),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    // data
    items: data?.items ?? [],
    page: data?.page ?? 1,
    limit: data?.limit ?? data?.items?.length ?? 0,
    total: data?.total ?? data?.items?.length ?? 0,
    hasMore: data?.hasMore ?? false,

    // states
    isLoading,
    isFetching,
    error,

    // actions
    refetch,
  };
}
