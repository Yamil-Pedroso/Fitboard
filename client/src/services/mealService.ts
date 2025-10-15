import axiosInstance from "@/api/axiosConfig";

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";
export type QtyUnit = "g" | "ml" | "unit";

export interface IMeal {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  recipeId?: string;
  servings?: number;
  customItem?: {
    name: string;
    amount: number;
    unit: QtyUnit;
    nutritionBasis: {
      amount: number;
      unit: QtyUnit;
    };
    macrosPerBasis: {
      kcal: number;
      protein: number;
      carbohydrate: number;
      fat: number;
    };
    gramsPerUnit?: number;
    densityGPerMl?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type CreateMealInput =
  | {
      date: string; // "YYYY-MM-DD"
      slot: MealSlot; // "breakfast" | "lunch" | "dinner" | "snack"
      recipeId: string;
      servings: number;
    }
  | {
      date: string;
      slot: MealSlot;
      customItem: {
        name: string;
        amount: number;
        unit: QtyUnit; // "g" | "ml" | "unit"
        nutritionBasis: { amount: number; unit: QtyUnit };
        macrosPerBasis: {
          kcal: number;
          protein: number;
          carbohydrate: number;
          fat: number;
        };
        gramsPerUnit?: number;
        densityGPerMl?: number;
      };
    };

export interface IListMealsParams {
  page?: number;
  limit?: number;
  q?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  slot?: MealSlot;
  sort?: "date" | "-date" | "createdAt" | "-createdAt";
}

export type ListMealsResponse = {
  page: number;
  limit: number;
  total: number;
  items: IMeal[];
};

/* ——— List all (paginated) ——— */
export async function listAllMeals(
  params: IListMealsParams = {}
): Promise<ListMealsResponse> {
  const { data } = await axiosInstance.get<ListMealsResponse>("/meals", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      sort: params.sort ?? "-date",
      q: params.q,
      from: params.from,
      to: params.to,
      slot: params.slot,
    },
  });
  return data;
}

// GET /meals/day?date=YYYY-MM-DD
export async function listMealsByDay(date: string) {
  const { data } = await axiosInstance.get<{ date: string; items: IMeal[] }>(
    "/meals/day",
    { params: { date } }
  );
  return data;
}

// GET /meals/range?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function listMealsByRange(from: string, to: string) {
  const { data } = await axiosInstance.get<{
    from: string;
    to: string;
    items: IMeal[];
  }>("/meals/range", { params: { from, to } });
  return data;
}

// POST /meal Create a meal
export async function createMeal(input: CreateMealInput): Promise<IMeal> {
  const { data } = await axiosInstance.post<IMeal>("/meals", input);
  return data;
}

// DELETE /meals/:id Delete a meal
export async function deleteMeal(mealId: string): Promise<void> {
  await axiosInstance.delete(`/meals/${mealId}`);
}
