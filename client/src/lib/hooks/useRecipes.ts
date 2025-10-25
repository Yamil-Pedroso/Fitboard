/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  type UseQueryResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  listAllRecipes,
  createRecipe,
  updateRecipe,
  getRecipeById,
  deleteRecipe,
  type IListRecipesParams,
  type CreateRecipeInput,
  type UpdateRecipeInput,
  type ListRecipesResponse,
} from "@/services/recipeService";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

type RecipesKey = readonly ["recipes", IListRecipesParams];

export function useRecipes(
  params: IListRecipesParams = { page: 1, limit: 20, sort: "-createdAt" }
) {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  }: UseQueryResult<ListRecipesResponse, Error> = useQuery<
    ListRecipesResponse,
    Error,
    ListRecipesResponse,
    RecipesKey
  >({
    queryKey: ["recipes", params] as const,
    queryFn: (): Promise<ListRecipesResponse> => listAllRecipes(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return {
    recipes: data?.items ?? [],
    page: data?.page ?? params.page ?? 1,
    limit: data?.limit ?? params.limit ?? 20,
    total: data?.total ?? 0,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

export function useGetRecipeById(recipeId: string) {
  return useQuery({
    queryKey: ["recipes", recipeId],
    queryFn: () => getRecipeById(recipeId),
    enabled: !!recipeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRecipe() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: CreateRecipeInput) => createRecipe(input),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
      qc.invalidateQueries({ queryKey: ["recipes", "day", created.date] });
      toast.success("Recipe created successfully!");
      navigate({ to: "/recipes", replace: true });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.error || err?.message || "Coul not create recipe";
      toast.error(msg);
    },
  });
}

export function useUpdateRecipe() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (vars: { recipeId: string; input: UpdateRecipeInput }) =>
      updateRecipe(vars.recipeId, vars.input),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["recipes"] });
      qc.invalidateQueries({
        queryKey: ["recipes", updated._id, "day", updated.date],
      });
      toast.success("Recipe updated successfully!");
      navigate({ to: "/recipes", replace: true });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error || err?.message || "Could not update recipe";
      toast.error(msg);
    },
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      toast.success("Recipe deleted!");
      qc.invalidateQueries({ queryKey: ["recipes"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? "Coul not delete recipe");
    },
  });
}
