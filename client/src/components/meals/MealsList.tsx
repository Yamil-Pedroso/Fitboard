/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Route as UpdateMealRoute } from "@/routes/meals/update/$mealId";
import { useMeals, useDeleteMeal } from "@/lib/hooks/useMeals";
import { FaPlus } from "react-icons/fa6";

const slotBadge: Record<string, string> = {
  breakfast: "bg-amber-100 text-amber-800",
  lunch: "bg-emerald-100 text-emerald-800",
  dinner: "bg-indigo-100 text-indigo-800",
  snack: "bg-pink-100 text-pink-800",
};

const MealsList = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    sort: "-date" as const,
  });

  const { meals, page, total, isLoading } = useMeals(params);
  const { mutate: deleteMeal, isPending } = useDeleteMeal();

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!confirmId) return;
      const el = e.target as Node;
      if (!(el as HTMLElement).closest(`[data-confirm-for="${confirmId}"]`)) {
        setConfirmId(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmId(null);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [confirmId]);

  const handleUpdateMealClick = (mealId: string) => {
    navigate({ to: UpdateMealRoute.to, params: { mealId } });
  };

  const totalPages = Math.max(1, Math.ceil(total / (params.limit ?? 20)));

  return (
    <div className="p-6 space-y-6 text-black">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Meals</h1>
          <p className="text-sm text-neutral-500">
            Log your meals and track your macros.
          </p>
        </div>

        <Link
          to="/meals/create"
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 font-medium text-black shadow-sm hover:bg-lime-300"
        >
          <FaPlus />
          New meal
        </Link>
      </div>

      {/* TABLE DESKTOP */}
      <div className="hidden rounded-2xl border border-neutral-200 bg-white/80 shadow-sm lg:block">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-neutral-50/80 backdrop-blur">
            <tr className="text-neutral-600">
              <Th>Date</Th>
              <Th>Slot</Th>
              <Th>Item</Th>
              <Th>Amount</Th>
              <Th>kcal/100</Th>
              <Th>P</Th>
              <Th>C</Th>
              <Th>F</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <LoadingRows />
            ) : meals.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-neutral-500">
                  No meals found
                </td>
              </tr>
            ) : (
              meals.map((m, idx) => (
                <tr
                  key={m._id}
                  className={`border-t ${
                    idx % 2 ? "bg-neutral-50/50" : "bg-transparent"
                  } hover:bg-neutral-50 transition`}
                >
                  <Td>
                    <span className="font-medium">{m.date}</span>
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        slotBadge[m.slot] ?? "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {m.slot}
                    </span>
                  </Td>

                  <Td className="max-w-[300px] truncate font-medium">
                    {m.customItem?.name ?? `Recipe ${m.recipeId}`}
                  </Td>

                  <Td>
                    {m.customItem
                      ? `${m.customItem.amount ?? ""}${m.customItem.unit ?? ""}`
                      : `${m.servings} serving(s)`}
                  </Td>

                  <Td>{m.customItem?.macrosPerBasis?.kcal ?? "-"}</Td>
                  <Td>{m.customItem?.macrosPerBasis?.protein ?? "-"}</Td>
                  <Td>{m.customItem?.macrosPerBasis?.carbohydrate ?? "-"}</Td>
                  <Td>{m.customItem?.macrosPerBasis?.fat ?? "-"}</Td>

                  <Td className="text-right">
                    <div className="relative inline-flex gap-2">
                      <button
                        className="rounded-lg border border-neutral-200 px-2.5 py-1.5 hover:bg-neutral-50"
                        onClick={() => handleUpdateMealClick(m._id)}
                      >
                        Edit
                      </button>

                      <button
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-red-600 hover:bg-red-50"
                        onClick={() => setConfirmId(m._id)}
                        disabled={isPending && confirmId === m._id}
                      >
                        {isPending && confirmId === m._id
                          ? "Deleting…"
                          : "Delete"}
                      </button>

                      {confirmId === m._id && (
                        <ConfirmPopover
                          anchorId={m._id}
                          isPending={isPending}
                          onConfirm={() =>
                            deleteMeal(m._id, {
                              onSettled: () => setConfirmId(null),
                            })
                          }
                          onCancel={() => setConfirmId(null)}
                        />
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <div className="h-5 w-40 animate-pulse bg-neutral-200 rounded" />
          </div>
        ) : meals.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-6 text-center text-neutral-500">
            No meals found
          </div>
        ) : (
          meals.map((m) => (
            <div
              key={m._id}
              className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{m.date}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        slotBadge[m.slot] ?? "bg-neutral-100"
                      }`}
                    >
                      {m.slot}
                    </span>
                  </div>

                  <p className="mt-1 text-sm truncate">
                    {m.customItem?.name ?? `Recipe ${m.recipeId}`}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <MacroPill
                      label="kcal"
                      value={m.customItem?.macrosPerBasis?.kcal}
                    />
                    <MacroPill
                      label="P"
                      value={m.customItem?.macrosPerBasis?.protein}
                    />
                    <MacroPill
                      label="C"
                      value={m.customItem?.macrosPerBasis?.carbohydrate}
                    />
                    <MacroPill
                      label="F"
                      value={m.customItem?.macrosPerBasis?.fat}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <button
                    className="rounded-lg border px-2 py-1 text-sm cursor-pointer"
                    onClick={() => handleUpdateMealClick(m._id)}
                  >
                    Edit
                  </button>

                  <button
                    className="rounded-lg border border-red-200 px-2 py-1 text-sm text-red-600 cursor-pointer"
                    onClick={() => setConfirmId(m._id)}
                    disabled={isPending && confirmId === m._id}
                  >
                    {isPending && confirmId === m._id ? "Deleting…" : "Delete"}
                  </button>
                  {confirmId === m._id && (
                    <ConfirmPopover
                      anchorId={m._id}
                      isPending={isPending}
                      onConfirm={() =>
                        deleteMeal(m._id, {
                          onSettled: () => setConfirmId(null),
                        })
                      }
                      onCancel={() => setConfirmId(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row ">
        <span className="text-sm text-neutral-600">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            className="rounded-xl border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() =>
              setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
            }
          >
            Prev
          </button>

          <button
            className="rounded-xl border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() =>
              setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

function MacroPill({ label, value }: { label: string; value?: number }) {
  return (
    <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs">
      {label}: {value ?? "-"}
    </span>
  );
}

function Th({ children }: React.PropsWithChildren) {
  return (
    <th className="p-3 text-left text-[11px] font-semibold uppercase tracking-wide">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: any) {
  return <td className={`p-3 ${className}`}>{children}</td>;
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-t">
          <td colSpan={9} className="p-3">
            <div className="h-5 w-full animate-pulse rounded bg-neutral-100" />
          </td>
        </tr>
      ))}
    </>
  );
}

function ConfirmPopover({
  anchorId,
  isPending,
  onConfirm,
  onCancel,
}: {
  anchorId: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      data-confirm-for={anchorId}
      className="absolute right-0 top-full mt-2 w-50 rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur p-4 shadow-xl z-50"
    >
      <div className="flex flex-col items-center">
        <p className="mb-2 font-semibold">Delete meal?</p>
        <p className="mb-3 text-sm text-center text-neutral-500">
          This action cannot be undone.
        </p>
      </div>

      <div className="flex justify-center gap-2">
        <button
          className="rounded-xl border px-3 py-1.5 hover:bg-neutral-50"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          className="rounded-xl bg-red-500 px-3 py-1.5 text-white hover:bg-red-600"
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default MealsList;
