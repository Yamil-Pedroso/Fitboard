import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCreateMeal } from "@/lib/hooks/useMeals";
import type { MealSlot, QtyUnit } from "@/services/mealService";

const todayStr = new Date().toISOString().slice(0, 10);

const CreateMeal = () => {
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
    val: (typeof form.customItem)[K],
  ) {
    setForm((p) => ({ ...p, customItem: { ...p.customItem, [key]: val } }));
  }

  function setCINB<K extends keyof typeof form.customItem.nutritionBasis>(
    key: K,
    val: (typeof form.customItem.nutritionBasis)[K],
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
    val: (typeof form.customItem.macrosPerBasis)[K],
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
      mutate({
        date: form.date,
        slot: form.slot,
        customItem: form.customItem,
      });
    } else {
      if (!form.recipeId || !form.servings) return;

      mutate({
        date: form.date,
        slot: form.slot,
        recipeId: form.recipeId,
        servings: form.servings,
      });
    }
  }

  return (
    <div className="p-6 pt-24 flex justify-center text-black">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xl space-y-5 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-6 shadow-sm"
      >
        <div>
          <h2 className="text-xl font-semibold">Create meal</h2>
          <p className="text-sm text-neutral-500">
            Add a custom item or select a recipe.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Date</span>
            <input
              type="date"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
              value={form.date}
              onChange={(e) => set("date", e.currentTarget.value)}
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-neutral-600">Slot</span>
            <select
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
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

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.mode === "custom"}
              onChange={() => set("mode", "custom")}
            />
            Custom
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={form.mode === "recipe"}
              onChange={() => set("mode", "recipe")}
            />
            Recipe
          </label>
        </div>

        {form.mode === "recipe" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-neutral-600">Recipe ID</span>
              <input
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                value={form.recipeId}
                onChange={(e) => set("recipeId", e.currentTarget.value)}
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-neutral-600">Servings</span>
              <input
                type="number"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                value={form.servings}
                onChange={(e) => set("servings", Number(e.currentTarget.value))}
              />
            </label>
          </div>
        )}

        {form.mode === "custom" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-neutral-600">Name</span>
                <input
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                  value={form.customItem.name}
                  onChange={(e) => setCI("name", e.currentTarget.value)}
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-neutral-600">Amount</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                  value={form.customItem.amount}
                  onChange={(e) =>
                    setCI("amount", Number(e.currentTarget.value))
                  }
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-neutral-600">Unit</span>
                <select
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
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
              <label className="text-sm">
                <span className="mb-1 block text-neutral-600">Basis</span>
                <input
                  type="number"
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                  value={form.customItem.nutritionBasis.amount}
                  onChange={(e) =>
                    setCINB("amount", Number(e.currentTarget.value))
                  }
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-neutral-600">Unit</span>
                <select
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2"
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

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["kcal", "protein", "carbohydrate", "fat"].map((key) => (
                <input
                  key={key}
                  type="number"
                  className="rounded-xl border border-neutral-300 px-3 py-2"
                  value={
                    form.customItem.macrosPerBasis[
                      key as keyof typeof form.customItem.macrosPerBasis
                    ]
                  }
                  onChange={(e) =>
                    setCIMP(
                      key as keyof typeof form.customItem.macrosPerBasis,
                      Number(e.currentTarget.value),
                    )
                  }
                />
              ))}
            </div>

            <input
              type="number"
              placeholder="grams per unit"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={form.customItem.gramsPerUnit ?? ""}
              onChange={(e) =>
                setCI(
                  "gramsPerUnit",
                  e.currentTarget.value === ""
                    ? undefined
                    : parseFloat(e.currentTarget.value),
                )
              }
            />

            <input
              type="number"
              placeholder="density (g/ml)"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={form.customItem.densityGPerMl ?? ""}
              onChange={(e) =>
                setCI(
                  "densityGPerMl",
                  e.currentTarget.value === ""
                    ? undefined
                    : parseFloat(e.currentTarget.value),
                )
              }
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error.message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-lime-400 py-2.5 font-medium text-black hover:bg-lime-300 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save meal"}
        </button>

        <Link
          to="/meals"
          className="block text-center text-sm text-neutral-600 hover:underline"
        >
          Back to meals
        </Link>
      </form>
    </div>
  );
};

export default CreateMeal;
