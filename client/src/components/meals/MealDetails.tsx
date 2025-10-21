import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Route } from "@/routes/meals/details/$mealId";
import { useMeal, useDeleteMeal } from "@/lib/hooks/useMeals";
import type { IMeal, QtyUnit } from "@/services/mealService";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-black">
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
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/80">
        {title}
      </h3>
      {children}
    </section>
  );
}

// ---- Helpers de conversión para customItem ----
function convertAmountToBasisUnit(opts: {
  amount: number; // cantidad consumida
  from: QtyUnit; // unidad de consumo (g|ml|unit)
  to: QtyUnit; // unidad de la base (g|ml|unit)
  gramsPerUnit?: number; // g por unidad si aplica
  densityGPerMl?: number; // g/ml si aplica
}): number | null {
  const { amount, from, to, gramsPerUnit, densityGPerMl } = opts;

  if (from === to) return amount;

  // unit → g o ml
  if (from === "unit") {
    if (to === "g") {
      if (gramsPerUnit != null) return amount * gramsPerUnit;
      return null;
    }
    if (to === "ml") {
      if (gramsPerUnit != null && densityGPerMl != null) {
        const grams = amount * gramsPerUnit;
        return grams / densityGPerMl; // ml = g / (g/ml)
      }
      return null;
    }
  }

  // g ↔ ml con densidad
  if (from === "g" && to === "ml") {
    if (densityGPerMl != null && densityGPerMl > 0)
      return amount / densityGPerMl;
    return null;
  }
  if (from === "ml" && to === "g") {
    if (densityGPerMl != null) return amount * densityGPerMl;
    return null;
  }

  // ml → unit (no tenemos “ml por unit”, necesitaríamos ambos para invertir)
  if (from === "ml" && to === "unit") {
    if (gramsPerUnit != null && densityGPerMl != null) {
      // ml → g → unit
      const grams = amount * densityGPerMl;
      return gramsPerUnit > 0 ? grams / gramsPerUnit : null;
    }
    return null;
  }
  // g → unit
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

  // Intentamos llevar la cantidad consumida a la unidad de la base
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
      <div className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-black/10" />
        <div className="h-48 animate-pulse rounded-2xl bg-black/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 text-red-600">
        Failed to load meal.
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 text-red-600">
        Meal not found.
      </div>
    );
  }

  const isCustom = !!meal.customItem;

  return (
    <div className="mx-auto w-full max-w-4xl p-6 text-black">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Meal details</h1>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Badge>{meal.date}</Badge>
            <Badge>{meal.slot}</Badge>
            <span className="opacity-60">
              Created: {new Date(meal.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/meals/update/$mealId"
            params={{ mealId: meal._id }}
            className="rounded border px-3 py-2 text-sm hover:bg-black/5"
          >
            Edit
          </Link>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="rounded border px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <Link
            to="/meals"
            className="rounded border px-3 py-2 text-sm hover:bg-black/5"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Left: resumen item */}
        <Section title={isCustom ? "Custom item" : "Recipe"}>
          {isCustom ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="opacity-70">Name</span>
                <strong>{meal.customItem!.name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Amount</span>
                <strong>
                  {meal.customItem!.amount}
                  {meal.customItem!.unit}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Basis</span>
                <strong>
                  {meal.customItem!.nutritionBasis.amount}
                  {meal.customItem!.nutritionBasis.unit}
                </strong>
              </div>

              {(meal.customItem!.gramsPerUnit != null ||
                meal.customItem!.densityGPerMl != null) && (
                <div className="grid grid-cols-2 gap-2">
                  {meal.customItem!.gramsPerUnit != null && (
                    <div className="rounded border p-2">
                      <div className="text-xs opacity-70">g per unit</div>
                      <div className="font-medium">
                        {meal.customItem!.gramsPerUnit}
                      </div>
                    </div>
                  )}
                  {meal.customItem!.densityGPerMl != null && (
                    <div className="rounded border p-2">
                      <div className="text-xs opacity-70 text-black">
                        density (g/ml)
                      </div>
                      <div className="font-medium">
                        {meal.customItem!.densityGPerMl}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="opacity-70">Recipe ID</span>
                <strong>{meal.recipeId}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Servings</span>
                <strong>{meal.servings}</strong>
              </div>
              <p className="mt-2 text-xs opacity-70">
                (Puedes mostrar aquí el nombre de la receta si la cargas por ID)
              </p>
            </div>
          )}
        </Section>

        {/* Right: nutrición */}
        <Section title="Nutrition">
          {isCustom ? (
            <>
              <div className="mb-3 text-sm">
                <div className="font-medium">Per basis</div>
                <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                  <div className="rounded border p-2">
                    <div className="text-xs opacity-70">kcal</div>
                    <div className="font-semibold">
                      {meal.customItem!.macrosPerBasis.kcal}
                    </div>
                  </div>
                  <div className="rounded border p-2">
                    <div className="text-xs opacity-70">protein</div>
                    <div className="font-semibold">
                      {meal.customItem!.macrosPerBasis.protein}g
                    </div>
                  </div>
                  <div className="rounded border p-2">
                    <div className="text-xs opacity-70">carbs</div>
                    <div className="font-semibold">
                      {meal.customItem!.macrosPerBasis.carbohydrate}g
                    </div>
                  </div>
                  <div className="rounded border p-2">
                    <div className="text-xs opacity-70">fat</div>
                    <div className="font-semibold">
                      {meal.customItem!.macrosPerBasis.fat}g
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <div className="mb-1 font-medium">
                  Estimated total for this meal
                </div>
                {computed?.totals ? (
                  <>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="rounded border p-2">
                        <div className="text-xs opacity-70">kcal</div>
                        <div className="font-semibold">
                          {computed.totals.kcal}
                        </div>
                      </div>
                      <div className="rounded border p-2">
                        <div className="text-xs opacity-70">protein</div>
                        <div className="font-semibold">
                          {computed.totals.protein}g
                        </div>
                      </div>
                      <div className="rounded border p-2">
                        <div className="text-xs opacity-70">carbs</div>
                        <div className="font-semibold">
                          {computed.totals.carbohydrate}g
                        </div>
                      </div>
                      <div className="rounded border p-2">
                        <div className="text-xs opacity-70">fat</div>
                        <div className="font-semibold">
                          {computed.totals.fat}g
                        </div>
                      </div>
                    </div>
                    {computed.factor != null && (
                      <div className="mt-2 text-xs opacity-70">
                        factor = {computed.factor.toFixed(3)} (amount convertido
                        a la unidad de la base / base)
                      </div>
                    )}
                  </>
                ) : (
                  <p className="rounded border p-3 text-xs opacity-80">
                    No se pudo estimar el total: falta información para
                    convertir entre unidades. (Ej.: para unit→g necesitas{" "}
                    <code>gramsPerUnit</code>, para g↔ml necesitas{" "}
                    <code>densityGPerMl</code>.)
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm opacity-70">
              Esta meal proviene de una receta. Puedes calcular los totales a
              partir de los ingredientes de la receta × servings (si cargas la
              receta).
            </p>
          )}
        </Section>
      </div>

      {/* Confirm delete */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-2 text-lg font-semibold">Delete meal</h4>
            <p className="mb-4 text-sm opacity-80">
              Are you sure you want to delete this meal? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded border px-3 py-2 text-sm"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded border px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                disabled={deleting}
                onClick={() =>
                  deleteMeal(meal._id, {
                    onSuccess: () => navigate({ to: "/meals" }),
                    onSettled: () => setConfirmOpen(false),
                  })
                }
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealDetails;
