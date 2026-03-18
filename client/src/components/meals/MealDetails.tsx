/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Route } from "@/routes/meals/details/$mealId";
import { useMeal, useDeleteMeal } from "@/lib/hooks/useMeals";
import type { IMeal, QtyUnit } from "@/services/mealService";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-700 bg-white/80 backdrop-blur">
      {children}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-700">
        {title}
      </h3>
      {children}
    </section>
  );
}

function convertAmountToBasisUnit(opts: {
  amount: number;
  from: QtyUnit;
  to: QtyUnit;
  gramsPerUnit?: number;
  densityGPerMl?: number;
}): number | null {
  const { amount, from, to, gramsPerUnit, densityGPerMl } = opts;

  if (from === to) return amount;

  if (from === "unit") {
    if (to === "g") {
      if (gramsPerUnit != null) return amount * gramsPerUnit;
      return null;
    }
    if (to === "ml") {
      if (gramsPerUnit != null && densityGPerMl != null) {
        const grams = amount * gramsPerUnit;
        return grams / densityGPerMl;
      }
      return null;
    }
  }

  if (from === "g" && to === "ml") {
    if (densityGPerMl != null && densityGPerMl > 0)
      return amount / densityGPerMl;
    return null;
  }

  if (from === "ml" && to === "g") {
    if (densityGPerMl != null) return amount * densityGPerMl;
    return null;
  }

  if (from === "ml" && to === "unit") {
    if (gramsPerUnit != null && densityGPerMl != null) {
      const grams = amount * densityGPerMl;
      return gramsPerUnit > 0 ? grams / gramsPerUnit : null;
    }
    return null;
  }

  if (from === "g" && to === "unit") {
    if (gramsPerUnit != null && gramsPerUnit > 0) return amount / gramsPerUnit;
    return null;
  }

  return null;
}

function calcEstimatedTotals(ci: NonNullable<IMeal["customItem"]>) {
  const {
    amount,
    unit,
    nutritionBasis,
    macrosPerBasis,
    gramsPerUnit,
    densityGPerMl,
  } = ci;

  const amountInBasis = convertAmountToBasisUnit({
    amount,
    from: unit,
    to: nutritionBasis.unit as QtyUnit,
    gramsPerUnit,
    densityGPerMl,
  });

  if (amountInBasis == null || nutritionBasis.amount <= 0) {
    return { totals: null, factor: null };
  }

  const factor = amountInBasis / nutritionBasis.amount;

  const totals = {
    kcal: +(macrosPerBasis.kcal * factor).toFixed(1),
    protein: +(macrosPerBasis.protein * factor).toFixed(1),
    carbohydrate: +(macrosPerBasis.carbohydrate * factor).toFixed(1),
    fat: +(macrosPerBasis.fat * factor).toFixed(1),
  };

  return { totals, factor };
}

const MealDetails = () => {
  const { mealId } = Route.useParams();
  const navigate = useNavigate();
  const { mutate: deleteMeal, isPending: deleting } = useDeleteMeal();
  const { data: meal, isLoading, error } = useMeal(mealId);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const computed = useMemo(() => {
    if (!meal?.customItem) return null;
    return calcEstimatedTotals(meal.customItem);
  }, [meal]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 pt-24">
        <div className="h-6 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="mt-4 h-48 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 text-red-500">
        Failed to load meal.
      </div>
    );
  }

  const isCustom = !!meal.customItem;

  return (
    <div className="mx-auto w-full max-w-4xl p-6 pt-24 text-black">
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Meal details</h1>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <Badge>{meal.date}</Badge>
            <Badge>{meal.slot}</Badge>
            <span className="text-neutral-500">
              {new Date(meal.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/meals/update/$mealId"
            params={{ mealId: meal._id }}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Edit
          </Link>

          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>

          <Link
            to="/meals"
            className="rounded-xl bg-lime-400 px-3 py-2 text-sm font-medium text-black hover:bg-lime-300"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Section title={isCustom ? "Custom item" : "Recipe"}>
          {isCustom ? (
            <div className="space-y-3 text-sm">
              <Row label="Name" value={meal.customItem!.name} />
              <Row
                label="Amount"
                value={`${meal.customItem!.amount}${meal.customItem!.unit}`}
              />
              <Row
                label="Basis"
                value={`${meal.customItem!.nutritionBasis.amount}${meal.customItem!.nutritionBasis.unit}`}
              />
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <Row label="Recipe ID" value={meal.recipeId} />
              <Row label="Servings" value={meal.servings} />
            </div>
          )}
        </Section>

        <Section title="Nutrition">
          {isCustom && computed?.totals ? (
            <div className="grid grid-cols-4 gap-3 text-center text-sm">
              <Macro label="kcal" value={computed.totals.kcal} />
              <Macro label="protein" value={`${computed.totals.protein}g`} />
              <Macro label="carbs" value={`${computed.totals.carbohydrate}g`} />
              <Macro label="fat" value={`${computed.totals.fat}g`} />
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Not enough data to calculate nutrition.
            </p>
          )}
        </Section>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-2">Delete meal</h4>

            <p className="text-sm text-neutral-600 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl border px-3 py-2 text-sm"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>

              <button
                className="rounded-xl bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
                onClick={() =>
                  deleteMeal(meal._id, {
                    onSuccess: () => navigate({ to: "/meals" }),
                  })
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-500">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Macro({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3 bg-white/80 backdrop-blur">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

export default MealDetails;
