export type Ingredient = {
  name: string;
  amount: number;
  unit: "g" | "ml" | "unit";
  nutritionBasis: { amount: number; unit: "g" | "ml" | "unit" };
  macrosPerBasis: {
    kcal: number;
    protein: number;
    carbohydrate: number;
    fat: number;
  };
  gramsPerUnit?: number;
  densityGPerMl?: number;
};

export type RecipeFormState = {
  name: string;
  servings: number;
  categoryIds: string[];
  ingredients: Ingredient[];
};

export type RecipeEditorProps = {
  initialData?: {
    _id: string;
    name: string;
    servings: number;
    categoryIds: string[];
    ingredients: Ingredient[];
  };
};

export type SortOption =
  | "-updatedAt"
  | "updatedAt"
  | "-createdAt"
  | "createdAt"
  | "name"
  | "-name";

export const SORT_LABEL: Record<SortOption, string> = {
  "-updatedAt": "Recently updated",
  updatedAt: "Least recently updated",
  "-createdAt": "Newest first",
  createdAt: "Oldest first",
  name: "Name A → Z",
  "-name": "Name Z → A",
};
