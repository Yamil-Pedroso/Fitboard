/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/recipes/update/$recipeId";

import { useUpdateRecipe, useGetRecipeById } from "@/lib/hooks/useRecipes";
import type { IIngredient, QtyUnit } from "@/services/recipeService";

const todayStr = new Date().toISOString().slice(0, 10);

// Estructura local del formulario (igual al ingrediente del backend)
type IngredientForm = {
  name: string;
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
};

const DEFAULT_ING: IngredientForm = {
  name: "",
  amount: 0,
  unit: "g",
  nutritionBasis: { amount: 100, unit: "g" },
  macrosPerBasis: { kcal: 0, protein: 0, carbohydrate: 0, fat: 0 },
};

export default function UpdateRecipe() {
  const { recipeId } = Route.useParams();
  const { mutate: updateRecipe, isPending, error } = useUpdateRecipe();
  const {
    data: recipe,
    isLoading: isLoadingRecipe,
    error: loadError,
  } = useGetRecipeById(recipeId);

  // Estado del form
  const [form, setForm] = useState<{
    date: string;
    name: string;
    servings: number;
    ingredients: IngredientForm[];
    categoryIds: string[];
  }>({
    date: todayStr,
    name: "",
    servings: 1,
    ingredients: [DEFAULT_ING],
    categoryIds: [],
  });

  // Inicializa cuando llega la receta
  useEffect(() => {
    if (!recipe) return;
    setForm({
      date: recipe.date ?? todayStr,
      name: recipe.name,
      servings: recipe.servings ?? 1,
      ingredients: (recipe.ingredients ?? []).map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        nutritionBasis: {
          amount: ing.nutritionBasis.amount,
          unit: ing.nutritionBasis.unit,
        },
        macrosPerBasis: {
          kcal: ing.macrosPerBasis.kcal,
          protein: ing.macrosPerBasis.protein,
          carbohydrate: ing.macrosPerBasis.carbohydrate,
          fat: ing.macrosPerBasis.fat,
        },
        gramsPerUnit: ing.gramsPerUnit,
        densityGPerMl: ing.densityGPerMl,
      })),
      categoryIds: recipe.categoryIds ?? [],
    });
  }, [recipe]);

  // Helpers de actualización
  function setField<K extends keyof typeof form>(
    key: K,
    val: (typeof form)[K],
  ) {
    setForm((p) => ({ ...p, [key]: val }));
  }
  function setIng<K extends keyof IngredientForm>(
    idx: number,
    key: K,
    val: IngredientForm[K],
  ) {
    setForm((p) => {
      const copy = [...p.ingredients];
      copy[idx] = { ...copy[idx], [key]: val };
      return { ...p, ingredients: copy };
    });
  }
  function setIngNB<K extends keyof IngredientForm["nutritionBasis"]>(
    idx: number,
    key: K,
    val: IngredientForm["nutritionBasis"][K],
  ) {
    setForm((p) => {
      const copy = [...p.ingredients];
      copy[idx] = {
        ...copy[idx],
        nutritionBasis: { ...copy[idx].nutritionBasis, [key]: val },
      };
      return { ...p, ingredients: copy };
    });
  }
  function setIngMacros<K extends keyof IngredientForm["macrosPerBasis"]>(
    idx: number,
    key: K,
    val: IngredientForm["macrosPerBasis"][K],
  ) {
    setForm((p) => {
      const copy = [...p.ingredients];
      copy[idx] = {
        ...copy[idx],
        macrosPerBasis: { ...copy[idx].macrosPerBasis, [key]: val },
      };
      return { ...p, ingredients: copy };
    });
  }
  function addIngredient() {
    setForm((p) => ({
      ...p,
      ingredients: [...p.ingredients, { ...DEFAULT_ING }],
    }));
  }
  function removeIngredient(idx: number) {
    setForm((p) => ({
      ...p,
      ingredients: p.ingredients.filter((_, i) => i !== idx),
    }));
  }

  // Calcular #ingredientes para UI
  const ingCount = useMemo(() => form.ingredients.length, [form.ingredients]);

  // Enviar PATCH (envío todo el objeto; tu DTO de Update acepta parcial)
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Cast a IIngredient (mismo shape)
    const ingredients: IIngredient[] = form.ingredients.map((ing) => ({
      ...ing,
      gramsPerUnit:
        ing.gramsPerUnit === undefined ? undefined : Number(ing.gramsPerUnit),
      densityGPerMl:
        ing.densityGPerMl === undefined ? undefined : Number(ing.densityGPerMl),
    }));

    updateRecipe({
      recipeId,
      input: {
        name: form.name.trim(),
        servings: Number(form.servings),
        ingredients,
        categoryIds: form.categoryIds,
        date: form.date,
      },
    });
  }

  if (isLoadingRecipe)
    return <div className="p-6 text-black">Loading recipe…</div>;
  if (loadError)
    return <div className="p-6 text-red-600">Failed to load recipe.</div>;
  if (!recipe) return <div className="p-6 text-red-600">Recipe not found.</div>;

  return (
    <div className="p-6 flex justify-center text-black">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl space-y-5 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-6 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-semibold">Edit recipe</h2>
          <p className="text-sm text-neutral-500">
            Update the details of your recipe.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block">Name</span>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
              value={form.name}
              onChange={(e) => setField("name", e.currentTarget.value)}
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Servings</span>
            <input
              type="number"
              min={1}
              step={1}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
              value={form.servings}
              onChange={(e) =>
                setField("servings", Number(e.currentTarget.value))
              }
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Date (optional)</span>
            <input
              type="date"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
              value={form.date}
              onChange={(e) => setField("date", e.currentTarget.value)}
            />
          </label>
        </div>

        {/* Ingredientes */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Ingredients ({ingCount})</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="inline-flex items-center rounded-xl bg-lime-400 px-4 py-2 font-medium text-black transition hover:bg-lime-300 disabled:opacity-50"
            >
              + Add ingredient
            </button>
          </div>

          {ingCount === 0 ? (
            <p className="text-sm opacity-70">No ingredients yet.</p>
          ) : (
            <div className="space-y-5">
              {form.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-neutral-200 bg-white/80 backdrop-blur p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium">#{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="text-sm text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block text-sm sm:col-span-2">
                      <span className="mb-1 block">Name</span>
                      <input
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.name}
                        onChange={(e) =>
                          setIng(i, "name", e.currentTarget.value)
                        }
                        required
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-1 block">Amount</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.amount}
                        onChange={(e) =>
                          setIng(
                            i,
                            "amount",
                            parseFloat(e.currentTarget.value) || 0,
                          )
                        }
                        required
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-1 block">Unit</span>
                      <select
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.unit}
                        onChange={(e) =>
                          setIng(i, "unit", e.currentTarget.value as QtyUnit)
                        }
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="unit">unit</option>
                      </select>
                    </label>
                  </div>

                  {/* Base nutricional */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <label className="block text-sm">
                      <span className="mb-1 block">Basis amount</span>
                      <input
                        type="number"
                        min={1}
                        step="any"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.nutritionBasis.amount}
                        onChange={(e) =>
                          setIngNB(
                            i,
                            "amount",
                            parseFloat(e.currentTarget.value) || 0,
                          )
                        }
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-1 block">Basis unit</span>
                      <select
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.nutritionBasis.unit}
                        onChange={(e) =>
                          setIngNB(i, "unit", e.currentTarget.value as QtyUnit)
                        }
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="unit">unit</option>
                      </select>
                    </label>
                  </div>

                  {/* Macros por base */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    <label className="block text-sm">
                      <span className="mb-1 block">kcal / basis</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.macrosPerBasis.kcal}
                        onChange={(e) =>
                          setIngMacros(
                            i,
                            "kcal",
                            parseFloat(e.currentTarget.value) || 0,
                          )
                        }
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block">Protein (g)</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.macrosPerBasis.protein}
                        onChange={(e) =>
                          setIngMacros(
                            i,
                            "protein",
                            parseFloat(e.currentTarget.value) || 0,
                          )
                        }
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block">Carbs (g)</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.macrosPerBasis.carbohydrate}
                        onChange={(e) =>
                          setIngMacros(
                            i,
                            "carbohydrate",
                            parseFloat(e.currentTarget.value) || 0,
                          )
                        }
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block">Fat (g)</span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                        value={ing.macrosPerBasis.fat}
                        onChange={(e) =>
                          setIngMacros(
                            i,
                            "fat",
                            parseFloat(e.currentTarget.value) || 0,
                          )
                        }
                      />
                    </label>
                  </div>

                  {/* Extras opcionales */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {ing.unit === "unit" && (
                      <label className="block text-sm">
                        <span className="mb-1 block">
                          Grams per unit (optional)
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                          value={ing.gramsPerUnit ?? ""}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
                            setIng(
                              i,
                              "gramsPerUnit",
                              v === "" ? undefined : parseFloat(v),
                            );
                          }}
                        />
                      </label>
                    )}

                    {ing.unit === "ml" && (
                      <label className="block text-sm">
                        <span className="mb-1 block">
                          Density (g/ml, optional)
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                          value={ing.densityGPerMl ?? ""}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
                            setIng(
                              i,
                              "densityGPerMl",
                              v === "" ? undefined : parseFloat(v),
                            );
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {(error as any)?.response?.data?.error || (error as any)?.message}
          </p>
        )}

        <div className="mt-6 flex flex-col items-center justify-center ">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center items-center rounded-xl bg-lime-400 px-4 py-2 font-medium text-black transition hover:bg-lime-300 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>

          <Link
            to="/recipes"
            className="block text-center text-sm text-neutral-600 hover:underline mt-3"
          >
            Back to recipes
          </Link>
        </div>
      </form>
    </div>
  );
}
