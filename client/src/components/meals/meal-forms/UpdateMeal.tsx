/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Route } from "@/routes/meals/update/$mealId";
import { useMeal, useUpdateMeal } from "@/lib/hooks/useMeals";
import { MealSlot, QtyUnit } from "@/services/mealService";

const UpdateMeal = () => {
  const { mealId } = Route.useParams();
  const { data: meal, isLoading } = useMeal(mealId);
  const { mutate: updateMeal, isPending } = useUpdateMeal();

  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<MealSlot>("breakfast");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [unit, setUnit] = useState<QtyUnit>("g");
  const [kcal, setKcal] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbohydrate, setCarbohydrate] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);

  useEffect(() => {
    if (!meal) return;
    setDate(meal.date);
    setSlot(meal.slot);
    if (meal.customItem) {
      setName(meal.customItem.name);
      setAmount(meal.customItem.amount);
      setUnit(meal.customItem.unit);
      setKcal(meal.customItem.macrosPerBasis.kcal);
      setProtein(meal.customItem.macrosPerBasis.protein);
      setCarbohydrate(meal.customItem.macrosPerBasis.carbohydrate);
      setFat(meal.customItem.macrosPerBasis.fat);
    }
  }, [meal]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-10 animate-pulse rounded bg-neutral-100" />
            <div className="h-10 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="mt-4 h-10 animate-pulse rounded bg-neutral-100" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-10 animate-pulse rounded bg-neutral-100" />
            <div className="h-10 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <div className="h-10 animate-pulse rounded bg-neutral-100" />
            <div className="h-10 animate-pulse rounded bg-neutral-100" />
            <div className="h-10 animate-pulse rounded bg-neutral-100" />
            <div className="h-10 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6 text-red-600 shadow-sm">
          Meal not found
        </div>
      </div>
    );
  }

  if (!meal.customItem) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-xl font-semibold text-black">Edit meal</h1>
          <p className="text-sm text-neutral-600">
            This meal was created from a recipe. Name is not editable. (Consider
            an editor for servings/slot/date.)
          </p>
        </div>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const patch: any = {};
    if (date !== meal?.date) patch.date = date;
    if (slot !== meal?.slot) patch.slot = slot;

    if (meal?.customItem) {
      patch.customItem = {};

      if (name !== meal?.customItem.name) patch.customItem.name = name;
      if (amount !== meal?.customItem.amount) patch.customItem.amount = amount;
      if (unit !== meal?.customItem.unit) patch.customItem.unit = unit;

      // construir sub-patch para macros
      const macrosPatch: any = {};
      if (kcal !== meal?.customItem.macrosPerBasis.kcal)
        macrosPatch.kcal = kcal;
      if (protein !== meal?.customItem.macrosPerBasis.protein)
        macrosPatch.protein = protein;
      if (carbohydrate !== meal?.customItem.macrosPerBasis.carbohydrate)
        macrosPatch.carbohydrate = carbohydrate;
      if (fat !== meal?.customItem.macrosPerBasis.fat) macrosPatch.fat = fat;

      if (Object.keys(macrosPatch).length > 0) {
        patch.customItem.macrosPerBasis = macrosPatch;
      }

      // Si customItem no cambió nada, elimínalo del patch
      if (Object.keys(patch.customItem).length === 0) delete patch.customItem;
    }

    if (Object.keys(patch).length === 0) return;

    updateMeal({ mealId, input: patch });
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border bg-white p-6 shadow-sm text-black"
      >
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold">Update meal</h1>
          <p className="text-sm text-neutral-500">
            Adjust date, slot and nutrition for this entry.
          </p>
        </div>

        {/* Date & Slot */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Date">
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={date}
              onChange={(e) => setDate(e.currentTarget.value)}
              required
            />
          </Field>
          <Field label="Meal">
            <select
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={slot}
              onChange={(e) => setSlot(e.currentTarget.value as MealSlot)}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </Field>
        </div>

        {/* Name */}
        <div className="mt-4">
          <Field label="Name">
            <input
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
            />
          </Field>
        </div>

        {/* Amount & Unit */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Amount">
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={Number.isFinite(amount) ? amount : 0}
              onChange={(e) => setAmount(parseFloat(e.currentTarget.value))}
            />
          </Field>
          <Field label="Unit">
            <select
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              value={unit}
              onChange={(e) => setUnit(e.currentTarget.value as QtyUnit)}
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="unit">unit</option>
            </select>
          </Field>
        </div>

        {/* Macros */}
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium text-neutral-700">
            Macros per basis
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Kcal">
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                value={Number.isFinite(kcal) ? kcal : 0}
                onChange={(e) => setKcal(parseFloat(e.currentTarget.value))}
              />
            </Field>
            <Field label="Protein (g)">
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                value={Number.isFinite(protein) ? protein : 0}
                onChange={(e) => setProtein(parseFloat(e.currentTarget.value))}
              />
            </Field>
            <Field label="Carbs (g)">
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                value={Number.isFinite(carbohydrate) ? carbohydrate : 0}
                onChange={(e) =>
                  setCarbohydrate(parseFloat(e.currentTarget.value))
                }
              />
            </Field>
            <Field label="Fat (g)">
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                value={Number.isFinite(fat) ? fat : 0}
                onChange={(e) => setFat(parseFloat(e.currentTarget.value))}
              />
            </Field>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center rounded-xl bg-neutral-900 px-4 py-2 text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Updating…" : "Update meal"}
          </button>
        </div>
      </form>
    </div>
  );
};

function Field({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

export default UpdateMeal;
