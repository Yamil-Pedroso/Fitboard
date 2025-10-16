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

  if (isLoading) return <div>Loading...</div>;
  if (!meal) return <div className="text-red-600">Meal not found</div>;

  if (!meal.customItem) {
    return (
      <div className="max-w-xl p-4">
        <h1 className="mb-4 text-xl font-semibold text-black">Edit meal</h1>
        <p className="text-black">
          This meal was created from a recipe. Name is not editable. (Consider
          an editor for servings/slot/date.)
        </p>
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
    <form onSubmit={onSubmit} className="max-w-md space-y-4 text-black">
      <label className="block text-sm">
        <span className="mb-1 block">Date</span>
        <input
          type="date"
          className="w-full rounded border px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.currentTarget.value)}
          required
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block">Meal</span>
        <select
          className="w-full rounded border px-3 py-2"
          value={slot}
          onChange={(e) => setSlot(e.currentTarget.value as MealSlot)}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </label>

      {meal.customItem && (
        <>
          <label className="block text-sm">
            <span className="mb-1 block">Name</span>
            <input
              className="w-full rounded border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block">Amount</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded border px-3 py-2"
                value={Number.isFinite(amount) ? amount : 0}
                onChange={(e) => setAmount(parseFloat(e.currentTarget.value))}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block">Unit</span>
              <select
                className="w-full rounded border px-3 py-2"
                value={unit}
                onChange={(e) => setUnit(e.currentTarget.value as QtyUnit)}
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="unit">unit</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block">Kcal</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded border px-3 py-2"
                value={Number.isFinite(kcal) ? kcal : 0}
                onChange={(e) => setKcal(parseFloat(e.currentTarget.value))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Protein</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded border px-3 py-2"
                value={Number.isFinite(protein) ? protein : 0}
                onChange={(e) => setProtein(parseFloat(e.currentTarget.value))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Carbohydrate</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded border px-3 py-2"
                value={Number.isFinite(carbohydrate) ? carbohydrate : 0}
                onChange={(e) =>
                  setCarbohydrate(parseFloat(e.currentTarget.value))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">Fat</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded border px-3 py-2"
                value={Number.isFinite(fat) ? fat : 0}
                onChange={(e) => setFat(parseFloat(e.currentTarget.value))}
              />
            </label>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Updating…" : "Update meal"}
      </button>
    </form>
  );
};

export default UpdateMeal;
