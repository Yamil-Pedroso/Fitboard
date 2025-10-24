import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Route as UpdateMealRoute } from "@/routes/meals/update/$mealId";
import { useMeals, useDeleteMeal } from "@/lib/hooks/useMeals";

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
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-black">Meals</h1>
          <p className="text-sm text-neutral-500">
            Log your meals and keep an eye on macros.
          </p>
        </div>
        <Link
          to="/meals/create"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-white shadow-sm hover:opacity-90"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
            <path fill="currentColor" d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z" />
          </svg>
          New meal
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-2xl border bg-white lg:block">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-neutral-50/90 backdrop-blur supports-[backdrop-filter]:bg-neutral-50/60">
            <tr className="text-neutral-700">
              <Th>Date</Th>
              <Th>Slot</Th>
              <Th>Item</Th>
              <Th>Amount</Th>
              <Th>kcal/100</Th>
              <Th>Protein/100</Th>
              <Th>Carbs/100</Th>
              <Th>Fat/100</Th>
              <Th className="text-right">Actions</Th>
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
                  className={`relative border-t ${
                    idx % 2 ? "bg-neutral-50/50" : "bg-white"
                  } hover:bg-neutral-50 transition-colors`}
                >
                  <Td>
                    <div className="font-medium text-black">{m.date}</div>
                  </Td>

                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shadow-sm ${
                        slotBadge[m.slot] ?? "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {m.slot}
                    </span>
                  </Td>

                  <Td className="max-w-[320px]">
                    <div className="truncate font-medium text-black">
                      {m.customItem?.name ?? `Recipe ${m.recipeId}`}
                    </div>
                    {/* optional notes
                    {m.customItem?.notes && (
                      <div className="truncate text-xs text-neutral-500">
                        {m.customItem.notes}
                      </div>
                    )}*/}
                  </Td>

                  <Td className="whitespace-nowrap">
                    {m.customItem
                      ? `${m.customItem.amount ?? ""}${m.customItem.unit ?? ""}`
                      : `${m.servings} serving(s)`}
                  </Td>

                  <Td>{m.customItem?.macrosPerBasis?.kcal ?? "-"}</Td>
                  <Td>{m.customItem?.macrosPerBasis?.protein ?? "-"}</Td>
                  <Td>{m.customItem?.macrosPerBasis?.carbohydrate ?? "-"}</Td>
                  <Td>{m.customItem?.macrosPerBasis?.fat ?? "-"}</Td>

                  <Td className="text-right">
                    <div className="relative inline-flex items-center gap-1">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 shadow-sm hover:bg-neutral-50"
                        onClick={() => handleUpdateMealClick(m._id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.84z"
                          />
                        </svg>
                        Edit
                      </button>

                      <button
                        className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-red-600 shadow-sm hover:bg-red-50"
                        onClick={() => setConfirmId(m._id)}
                        disabled={isPending && confirmId === m._id}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1z"
                          />
                        </svg>
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

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          <div className="rounded-2xl border bg-white p-4">
            <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
            <div className="mt-3 h-20 animate-pulse rounded-lg bg-neutral-100" />
          </div>
        ) : meals.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-neutral-500">
            No meals found
          </div>
        ) : (
          meals.map((m) => (
            <div
              key={m._id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">
                      {m.date}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ${
                        slotBadge[m.slot] ?? "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {m.slot}
                    </span>
                  </div>

                  <div className="mt-1 truncate text-sm text-black">
                    {m.customItem?.name ?? `Recipe ${m.recipeId}`}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                    <span className="rounded border px-2 py-0.5">
                      {m.customItem
                        ? `${m.customItem.amount ?? ""}${m.customItem.unit ?? ""}`
                        : `${m.servings} serving(s)`}
                    </span>
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

                <div className="relative shrink-0">
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg border px-2.5 py-1.5 text-sm shadow-sm hover:bg-neutral-50"
                      onClick={() => handleUpdateMealClick(m._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-lg border px-2.5 py-1.5 text-sm text-red-600 shadow-sm hover:bg-red-50"
                      onClick={() => setConfirmId(m._id)}
                      disabled={isPending && confirmId === m._id}
                    >
                      {isPending && confirmId === m._id
                        ? "Deleting…"
                        : "Delete"}
                    </button>
                  </div>

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

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 text-black sm:flex-row">
        <span className="text-sm text-neutral-600">
          Page {page} of {totalPages}
        </span>
        <div className="flex w-full max-w-xs justify-between sm:w-auto sm:space-x-2">
          <button
            className="w-[48%] rounded-xl border px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50 sm:w-auto"
            disabled={page <= 1}
            onClick={() =>
              setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
            }
          >
            Prev
          </button>
          <button
            className="w-[48%] rounded-xl border px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50 sm:w-auto"
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
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
      <span className="text-[10px] uppercase text-neutral-500">{label}</span>
      <span className="text-[11px] text-black">{value ?? "-"}</span>
    </span>
  );
}

function Th({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <th
      className={`p-3 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-600 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <td className={`p-3 align-top text-black ${className}`}>{children}</td>
  );
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
      className="absolute right-0 top-full z-10 mt-2 w-56 rounded-2xl border bg-white p-4 shadow-xl"
    >
      <p className="mb-3 font-semibold">Delete meal?</p>
      <p className="mb-3 text-sm text-neutral-600">
        This action cannot be undone.
      </p>
      <div className="flex items-center justify-end gap-3">
        <button
          className="rounded-xl border px-3 py-1.5 hover:bg-neutral-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="rounded-xl bg-red-600 px-3 py-1.5 text-white hover:opacity-90 disabled:opacity-70"
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
