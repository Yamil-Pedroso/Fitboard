/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  type UseQueryResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listAllMeals,
  createMeal,
  getMealById,
  updateMeal,
  deleteMeal,
  type CreateMealInput,
  type UpdateMealInput,
  type IListMealsParams,
  type ListMealsResponse,
} from "@/services/mealService";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

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
    placeholderData: (prev) => prev,
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

export function useCreateMeal() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: CreateMealInput) => createMeal(input),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      qc.invalidateQueries({ queryKey: ["meals", "day", created.date] });
      toast.success("Meal created successfully");
      navigate({ to: "/meals", replace: true });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error || err?.message || "Could not create meal";
      toast.error(msg);
    },
  });
}

export function useUpdateMeal() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (vars: { mealId: string; input: UpdateMealInput }) =>
      updateMeal(vars.mealId, vars.input),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["meals"] });
      qc.invalidateQueries({ queryKey: ["meals", "day", updated.date] });
      toast.success("Meal updated successfully");
      navigate({ to: "/meals", replace: true });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error || err?.message || "Could not update meal";
      toast.error(msg);
    },
  });
}

export function useMeal(mealId: string) {
  return useQuery({
    queryKey: ["meal", mealId] as const,
    queryFn: () => getMealById(mealId),
    enabled: !!mealId,
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMeal(id),
    onSuccess: () => {
      toast.success("Meal deleted");
      qc.invalidateQueries({ queryKey: ["meals"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? "Could not delete meal");
    },
  });
}
