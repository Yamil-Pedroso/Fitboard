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
