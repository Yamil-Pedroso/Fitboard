export type Unit = "g" | "ml" | "unit";
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export interface Macros {
  kcal: number;
  protein: number;
  carbohydrate: number;
  fat: number;
}

export interface NutritionBasis {
  amount: number;
  unit: Unit;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: Unit;
  nutritionBasis: NutritionBasis;
  macrosPerBasis: Macros;
  gramsPerUnit?: number;
  densityGPerMl?: number;
}

export interface CustomItems extends Ingredient {}
