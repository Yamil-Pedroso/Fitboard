import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { useCreateMeal } from "@/lib/hooks/useMeals";
import type { MealSlot, QtyUnit } from "@/services/mealService";

const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// setCI(...) → Custom Item
// Actualiza propiedades directas de form.customItem (p.ej. name, amount, unit, …).
// setCINB(...) → Custom Item Nutrition Basis
// Actualiza form.customItem.nutritionBasis (p.ej. amount, unit de la base).
// setCIMP(...) → Custom Item Macros Per-basis
// Actualiza form.customItem.macrosPerBasis (p.ej. kcal, protein, carbohydrate, fat).

export default function CreateMeal() {
  const { mutate, isPending, error } = useCreateMeal();

  const [form, setForm] = useState({
    mode: "custom" as "custom" | "recipe",
    date: todayStr,
    slot: "breakfast" as MealSlot,
    recipeId: "",
    servings: 1,
    customItem: {
      name: "",
      amount: 0,
      unit: "unit" as QtyUnit,
      nutritionBasis: { amount: 100, unit: "g" as QtyUnit },
      macrosPerBasis: { kcal: 0, protein: 0, carbohydrate: 0, fat: 0 },
      gramsPerUnit: undefined as number | undefined,
      densityGPerMl: undefined as number | undefined,
    },
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function setCI<K extends keyof typeof form.customItem>(
    key: K,
    val: (typeof form.customItem)[K]
  ) {
    setForm((p) => ({ ...p, customItem: { ...p.customItem, [key]: val } }));
  }

  function setCINB<K extends keyof typeof form.customItem.nutritionBasis>(
    key: K,
    val: (typeof form.customItem.nutritionBasis)[K]
  ) {
    setForm((p) => ({
      ...p,
      customItem: {
        ...p.customItem,
        nutritionBasis: { ...p.customItem.nutritionBasis, [key]: val },
      },
    }));
  }

  function setCIMP<K extends keyof typeof form.customItem.macrosPerBasis>(
    key: K,
    val: (typeof form.customItem.macrosPerBasis)[K]
  ) {
    setForm((p) => ({
      ...p,
      customItem: {
        ...p.customItem,
        macrosPerBasis: { ...p.customItem.macrosPerBasis, [key]: val },
      },
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.mode === "custom") {
      mutate(
        {
          date: form.date,
          slot: form.slot,
          customItem: form.customItem,
        },
        {
          onSuccess: () => {},
        }
      );
    } else {
      if (!form.recipeId || !form.servings) return; // validación básica
      mutate(
        {
          date: form.date,
          slot: form.slot,
          recipeId: form.recipeId,
          servings: form.servings,
        },
        {
          onSuccess: () => {},
        }
      );
    }
  }

  return (
    <div className="w-full   gap-2">
      <form
        onSubmit={onSubmit}
        className="w-full mx-auto max-w-xl space-y-4 rounded-2xl border p-6 text-black"
      >
        <h2 className="text-lg font-semibold">Create meal</h2>

        {/* Campos base */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block">Date</span>
            <input
              type="date"
              className="w-full rounded border px-3 py-2"
              value={form.date}
              onChange={(e) => set("date", e.currentTarget.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Slot</span>
            <select
              className="w-full rounded border px-3 py-2"
              value={form.slot}
              onChange={(e) => set("slot", e.currentTarget.value as MealSlot)}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </label>
        </div>

        {/* Modo */}
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={form.mode === "custom"}
              onChange={() => set("mode", "custom")}
            />
            Custom item
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={form.mode === "recipe"}
              onChange={() => set("mode", "recipe")}
            />
            Recipe
          </label>
        </div>

        {/* Sección: Recipe */}
        {form.mode === "recipe" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block">Recipe ID</span>
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="64f...e2"
                value={form.recipeId}
                onChange={(e) => set("recipeId", e.currentTarget.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Servings</span>
              <input
                type="number"
                min={0.1}
                step={0.1}
                className="w-full rounded border px-3 py-2"
                value={form.servings}
                onChange={(e) => set("servings", Number(e.currentTarget.value))}
              />
            </label>
          </div>
        )}

        {/* Sección: Custom item */}
        {form.mode === "custom" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block">Name</span>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.name}
                  onChange={(e) => setCI("name", e.currentTarget.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Amount</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.amount}
                  onChange={(e) =>
                    setCI("amount", Number(e.currentTarget.value))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Unit</span>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.unit}
                  onChange={(e) =>
                    setCI("unit", e.currentTarget.value as QtyUnit)
                  }
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="unit">unit</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="mb-1 block">Basis amount</span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.nutritionBasis.amount}
                  onChange={(e) =>
                    setCINB("amount", Number(e.currentTarget.value))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Basis unit</span>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.nutritionBasis.unit}
                  onChange={(e) =>
                    setCINB("unit", e.currentTarget.value as QtyUnit)
                  }
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="unit">unit</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <label className="block text-sm">
                <span className="mb-1 block">kcal / basis</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.macrosPerBasis.kcal}
                  onChange={(e) =>
                    setCIMP("kcal", Number(e.currentTarget.value))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Protein (g)</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.macrosPerBasis.protein}
                  onChange={(e) =>
                    setCIMP("protein", Number(e.currentTarget.value))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Carbs (g)</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.macrosPerBasis.carbohydrate}
                  onChange={(e) =>
                    setCIMP("carbohydrate", Number(e.currentTarget.value))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Fat (g)</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={form.customItem.macrosPerBasis.fat}
                  onChange={(e) =>
                    setCIMP("fat", Number(e.currentTarget.value))
                  }
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block">Grams per unit (optional)</span>
              <input
                type="number"
                step="any"
                min={0}
                className="w-full rounded border px-3 py-2"
                value={form.customItem.gramsPerUnit ?? ""}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setCI("gramsPerUnit", v === "" ? undefined : parseFloat(v));
                }}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Density (g/ml, optional)</span>
              <input
                type="number"
                step="any"
                min={0}
                className="w-full rounded border px-3 py-2"
                value={form.customItem.densityGPerMl ?? ""}
                onChange={(e) => {
                  const v = e.currentTarget.value;
                  setCI("densityGPerMl", v === "" ? undefined : parseFloat(v));
                }}
              />
            </label>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error.message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save meal"}
        </button>
      </form>

      <Link to="/meals" className="text-black underline underline-offset-1">
        Back meald
      </Link>
    </div>
  );
}
