import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  listAllMeals,
  type IListMealsParams,
  type ListMealsResponse,
} from "@/services/mealService";

type MealsKey = readonly ["meals", IListMealsParams];

export function useMeals(
  params: IListMealsParams = { page: 1, limit: 20, sort: "-date" }
) {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  }: UseQueryResult<ListMealsResponse, Error> = useQuery<
    ListMealsResponse,
    Error,
    ListMealsResponse,
    MealsKey
  >({
    queryKey: ["meals", params] as const,
    queryFn: (): Promise<ListMealsResponse> => listAllMeals(params),
    staleTime: 30_000,
    keepPreviousData: true,
  });

  return {
    meals: data?.items ?? [],
    page: data?.page ?? params.page ?? 1,
    limit: data?.limit ?? params.limit ?? 20,
    total: data?.total ?? 0,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
