import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/recipes/update/$recipeId";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosConfig";
import { useUpdateRecipe } from "@/lib/hooks/useRecipes";
import type { IRecipe, IIngredient, QtyUnit } from "@/services/recipeService";

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

async function fetchRecipe(id: string): Promise<IRecipe> {
  const { data } = await axiosInstance.get(`/recipes/${id}`);
  return data;
}

export default function UpdateRecipe() {
  const { recipeId } = Route.useParams();
  const { mutate: updateRecipe, isPending, error } = useUpdateRecipe();

  // Cargar receta
  const {
    data: recipe,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => fetchRecipe(recipeId),
    staleTime: 30_000,
  });

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
    val: (typeof form)[K]
  ) {
    setForm((p) => ({ ...p, [key]: val }));
  }
  function setIng<K extends keyof IngredientForm>(
    idx: number,
    key: K,
    val: IngredientForm[K]
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
    val: IngredientForm["nutritionBasis"][K]
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
    val: IngredientForm["macrosPerBasis"][K]
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

  if (isLoading) return <div className="p-6 text-black">Loading recipe…</div>;
  if (loadError)
    return <div className="p-6 text-red-600">Failed to load recipe.</div>;
  if (!recipe) return <div className="p-6 text-red-600">Recipe not found.</div>;

  return (
    <div className="mx-auto w-full max-w-3xl p-6 text-black">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit recipe</h1>
        <Link to="/recipes" className="underline">
          Back to recipes
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border p-6 bg-white"
      >
        {/* Básicos */}
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block">Name</span>
            <input
              className="w-full rounded border px-3 py-2"
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
              className="w-full rounded border px-3 py-2"
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
              className="w-full rounded border px-3 py-2"
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
              className="rounded bg-black px-3 py-2 text-white"
            >
              + Add ingredient
            </button>
          </div>

          {ingCount === 0 ? (
            <p className="text-sm opacity-70">No ingredients yet.</p>
          ) : (
            <div className="space-y-5">
              {form.ingredients.map((ing, i) => (
                <div key={i} className="rounded-xl border p-4">
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
                        className="w-full rounded border px-3 py-2"
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
                        className="w-full rounded border px-3 py-2"
                        value={ing.amount}
                        onChange={(e) =>
                          setIng(
                            i,
                            "amount",
                            parseFloat(e.currentTarget.value) || 0
                          )
                        }
                        required
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-1 block">Unit</span>
                      <select
                        className="w-full rounded border px-3 py-2"
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
                        className="w-full rounded border px-3 py-2"
                        value={ing.nutritionBasis.amount}
                        onChange={(e) =>
                          setIngNB(
                            i,
                            "amount",
                            parseFloat(e.currentTarget.value) || 0
                          )
                        }
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-1 block">Basis unit</span>
                      <select
                        className="w-full rounded border px-3 py-2"
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
                        className="w-full rounded border px-3 py-2"
                        value={ing.macrosPerBasis.kcal}
                        onChange={(e) =>
                          setIngMacros(
                            i,
                            "kcal",
                            parseFloat(e.currentTarget.value) || 0
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
                        className="w-full rounded border px-3 py-2"
                        value={ing.macrosPerBasis.protein}
                        onChange={(e) =>
                          setIngMacros(
                            i,
                            "protein",
                            parseFloat(e.currentTarget.value) || 0
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
                        className="w-full rounded border px-3 py-2"
                        value={ing.macrosPerBasis.carbohydrate}
                        onChange={(e) =>
                          setIngMacros(
                            i,
                            "carbohydrate",
                            parseFloat(e.currentTarget.value) || 0
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
                        className="w-full rounded border px-3 py-2"
                        value={ing.macrosPerBasis.fat}
                        onChange={(e) =>
                          setIngMacros(
                            i,
                            "fat",
                            parseFloat(e.currentTarget.value) || 0
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
                          className="w-full rounded border px-3 py-2"
                          value={ing.gramsPerUnit ?? ""}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
                            setIng(
                              i,
                              "gramsPerUnit",
                              v === "" ? undefined : parseFloat(v)
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
                          className="w-full rounded border px-3 py-2"
                          value={ing.densityGPerMl ?? ""}
                          onChange={(e) => {
                            const v = e.currentTarget.value;
                            setIng(
                              i,
                              "densityGPerMl",
                              v === "" ? undefined : parseFloat(v)
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

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
