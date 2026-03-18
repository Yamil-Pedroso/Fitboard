/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCreateRecipe } from "@/lib/hooks/useRecipes";
import type { QtyUnit, IIngredient } from "@/services/recipeService";

const todayStr = new Date().toISOString().slice(0, 10);

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

const CreateRecipe = () => {
  const { mutate, isPending, error } = useCreateRecipe();

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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const ingredients: IIngredient[] = form.ingredients.map((ing) => ({
      ...ing,
      gramsPerUnit:
        ing.gramsPerUnit === undefined ? undefined : Number(ing.gramsPerUnit),
      densityGPerMl:
        ing.densityGPerMl === undefined ? undefined : Number(ing.densityGPerMl),
    }));

    mutate({
      name: form.name.trim(),
      servings: Number(form.servings),
      ingredients,
      categoryIds: form.categoryIds,
      date: form.date,
    });
  }

  return (
    <div className="p-6 pt-24 flex justify-center text-black">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create recipe</h1>
          <Link
            to="/recipes"
            className="text-sm text-neutral-500 hover:underline"
          >
            Back to recipes
          </Link>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-6 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block text-neutral-600">Name</span>
              <input
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                value={form.name}
                onChange={(e) => setField("name", e.currentTarget.value)}
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-neutral-600">Servings</span>
              <input
                type="number"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                value={form.servings}
                onChange={(e) =>
                  setField("servings", Number(e.currentTarget.value))
                }
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-neutral-600">Date</span>
              <input
                type="date"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                value={form.date}
                onChange={(e) => setField("date", e.currentTarget.value)}
              />
            </label>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-medium">Ingredients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="rounded-xl bg-lime-400 px-3 py-2 text-sm font-medium text-black hover:bg-lime-300"
              >
                + Add ingredient
              </button>
            </div>

            {form.ingredients.length === 0 ? (
              <p className="text-sm text-neutral-500">No ingredients yet.</p>
            ) : (
              <div className="space-y-5">
                {form.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-200 bg-white/70 p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">#{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(i)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        className="sm:col-span-2 rounded-xl border border-neutral-300 px-3 py-2"
                        placeholder="Ingredient name"
                        value={ing.name}
                        onChange={(e) =>
                          setIng(i, "name", e.currentTarget.value)
                        }
                      />

                      <input
                        type="number"
                        className="rounded-xl border border-neutral-300 px-3 py-2"
                        placeholder="Amount"
                        value={ing.amount}
                        onChange={(e) =>
                          setIng(
                            i,
                            "amount",
                            parseFloat(e.currentTarget.value) || 0,
                          )
                        }
                      />

                      <select
                        className="rounded-xl border border-neutral-300 px-3 py-2"
                        value={ing.unit}
                        onChange={(e) =>
                          setIng(i, "unit", e.currentTarget.value as QtyUnit)
                        }
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="unit">unit</option>
                      </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="number"
                        className="rounded-xl border border-neutral-300 px-3 py-2"
                        placeholder="Basis amount"
                        value={ing.nutritionBasis.amount}
                        onChange={(e) =>
                          setIngNB(
                            i,
                            "amount",
                            parseFloat(e.currentTarget.value) || 0,
                          )
                        }
                      />

                      <select
                        className="rounded-xl border border-neutral-300 px-3 py-2"
                        value={ing.nutritionBasis.unit}
                        onChange={(e) =>
                          setIngNB(i, "unit", e.currentTarget.value as QtyUnit)
                        }
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="unit">unit</option>
                      </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                      {["kcal", "protein", "carbohydrate", "fat"].map((k) => (
                        <input
                          key={k}
                          type="number"
                          className="rounded-xl border border-neutral-300 px-3 py-2"
                          value={
                            ing.macrosPerBasis[
                              k as keyof typeof ing.macrosPerBasis
                            ]
                          }
                          onChange={(e) =>
                            setIngMacros(
                              i,
                              k as keyof typeof ing.macrosPerBasis,
                              parseFloat(e.currentTarget.value) || 0,
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {(error as any)?.response?.data?.error || error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-lime-400 py-2.5 font-medium text-black hover:bg-lime-300 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save recipe"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
