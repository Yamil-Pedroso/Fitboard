import axiosInstance from "@/api/axiosConfig";

export type QtyUnit = "g" | "ml" | "unit";

export interface IIngredient {
  name: string;
  date?: string;
  amount: number;
  unit: QtyUnit;
  nutritionBasis: { amount: number; unit: QtyUnit };
  macrosPerBasis: {
    kcal: number;
    protein: number;
    carbohydrate: number;
    fat: number;
  };
  gramsPerUnit?: number;
  densityGPerMl?: number;
}

export interface IRecipe {
  _id: string;
  userId: string;
  name: string;
  date?: string;
  servings: number;
  ingredients: IIngredient[];
  categoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateRecipeInput = {
  name: string;
  date?: string;
  servings?: number;
  ingredients?: IIngredient[];
  categoryIds?: string[];
};

export type UpdateRecipeInput = Partial<CreateRecipeInput>;

export interface IListRecipesParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  sort?: "name" | "-name" | "createdAt" | "-createdAt" | "date" | "-date";
}

export type ListRecipesResponse = {
  page: number;
  limit: number;
  total: number;
  items: IRecipe[];
};

export async function listAllRecipes(
  params: IListRecipesParams = {}
): Promise<ListRecipesResponse> {
  const { data } = await axiosInstance.get("/recipes", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      category: params.category,
      q: params.q,
      sort: params.sort ?? "-createdAt",
    },
  });
  console.log(`Get all recipes ${data}`);
  return data;
}

export async function createRecipe(input: CreateRecipeInput): Promise<IRecipe> {
  const { data } = await axiosInstance.post(`/recipes`, input);
  return data;
}

export async function updateRecipe(
  recipeId: string,
  input: UpdateRecipeInput
): Promise<IRecipe> {
  const { data } = await axiosInstance.patch(`/recipes/${recipeId}`, input);
  return data;
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await axiosInstance.delete(`/recipes/${recipeId}`);
}
