/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
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
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="rounded-2xl border app-surface backdrop-blur p-6 shadow-sm">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="space-y-3">
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
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="rounded-2xl border app-surface backdrop-blur p-6 text-red-500 shadow-sm">
          Meal not found
        </div>
      </div>
    );
  }

  if (!meal.customItem) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6">
        <div className="rounded-2xl border app-surface backdrop-blur p-6 shadow-sm">
          <h1 className="mb-2 text-xl font-semibold app-text">Edit meal</h1>
          <p className="text-sm app-muted">
            This meal was created from a recipe. Name is not editable.
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

      if (Object.keys(patch.customItem).length === 0) delete patch.customItem;
    }

    if (Object.keys(patch).length === 0) return;

    updateMeal({ mealId, input: patch });
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6 app-text">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border app-surface backdrop-blur p-6 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Update meal</h1>
          <p className="text-sm app-muted">
            Adjust date, slot and nutrition for this entry.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Date">
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2 app-control"
              value={date}
              onChange={(e) => setDate(e.currentTarget.value)}
              required
            />
          </Field>

          <Field label="Meal">
            <select
              className="w-full rounded-xl border px-3 py-2 app-control"
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

        <div className="mt-4">
          <Field label="Name">
            <input
              className="w-full rounded-xl border px-3 py-2 app-control"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
            />
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Amount">
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-xl border px-3 py-2 app-control"
              value={Number.isFinite(amount) ? amount : 0}
              onChange={(e) => setAmount(parseFloat(e.currentTarget.value))}
            />
          </Field>

          <Field label="Unit">
            <select
              className="w-full rounded-xl border px-3 py-2 app-control"
              value={unit}
              onChange={(e) => setUnit(e.currentTarget.value as QtyUnit)}
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="unit">unit</option>
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-sm font-medium app-muted">
            Macros per basis
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Kcal">
              <input
                type="number"
                className="w-20 w-full rounded-xl border px-3 py-2 app-control"
                value={Number.isFinite(kcal) ? kcal : 0}
                onChange={(e) => setKcal(parseFloat(e.currentTarget.value))}
              />
            </Field>

            <Field label="Protein (g)">
              <input
                type="number"
                className="w-full rounded-xl border px-3 py-2 app-control"
                value={Number.isFinite(protein) ? protein : 0}
                onChange={(e) => setProtein(parseFloat(e.currentTarget.value))}
              />
            </Field>

            <Field label="Carbs (g)">
              <input
                type="number"
                className="w-full rounded-xl border px-3 py-2 app-control"
                value={Number.isFinite(carbohydrate) ? carbohydrate : 0}
                onChange={(e) =>
                  setCarbohydrate(parseFloat(e.currentTarget.value))
                }
              />
            </Field>

            <Field label="Fat (g)">
              <input
                type="number"
                className="w-full rounded-xl border px-3 py-2 app-control"
                value={Number.isFinite(fat) ? fat : 0}
                onChange={(e) => setFat(parseFloat(e.currentTarget.value))}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center ">
          <button
            type="submit"
            disabled={isPending}
            className="w-full items-center rounded-xl bg-lime-400 px-4 py-2 font-medium text-black transition hover:bg-lime-300 disabled:opacity-50"
          >
            {isPending ? "Updating…" : "Update meal"}
          </button>

          <Link
            to="/meals"
            className="block text-center text-sm app-muted hover:underline mt-3"
          >
            Back to meals
          </Link>
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
      <span className="mb-1 block app-muted">{label}</span>
      {children}
    </label>
  );
}

export default UpdateMeal;
