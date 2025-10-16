import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Route as UpdateMealRoute } from "@/routes/meals/update/$mealId";
import { useMeals, useDeleteMeal } from "@/lib/hooks/useMeals";

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
    navigate({
      to: UpdateMealRoute.to,
      params: { mealId: mealId },
    });
  };

  return (
    <div className="p-6 space-y-4">
      <Link
        to="/meals/create"
        className="flex justify-center cursor-pointer bg-black w-[8rem] rounded-[.6rem] p-4"
      >
        New meal
      </Link>

      <div className=" rounded border">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b text-black">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Slot</th>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">kcal/100</th>
              <th className="p-2 text-left">Protein/100</th>
              <th className="p-2 text-left">Carbs/100</th>
              <th className="p-2 text-left">Fat/100</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="p-4" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : meals.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={6}>
                  No meals found
                </td>
              </tr>
            ) : (
              meals.map((m) => (
                <tr key={m._id} className="relative border-t text-black">
                  <td className="p-2">{m.date}</td>
                  <td className="p-2">{m.slot}</td>
                  <td className="p-2">
                    {m.customItem?.name ?? `Recipe ${m.recipeId}`}
                  </td>
                  <td className="p-2">
                    {m.customItem
                      ? `${m.customItem.amount}${m.customItem.unit}`
                      : `${m.servings} serving(s)`}
                  </td>
                  <td className="p-2">
                    {m.customItem?.macrosPerBasis.kcal ?? "-"}
                  </td>
                  <td className="p-2">
                    {m.customItem?.macrosPerBasis.protein ?? "-"}
                  </td>
                  <td className="p-2">
                    {m.customItem?.macrosPerBasis.carbohydrate ?? "-"}
                  </td>
                  <td className="p-2">
                    {m.customItem?.macrosPerBasis.fat ?? "-"}
                  </td>

                  <td className="p-2 text-right">
                    <button
                      className="px-2 underline"
                      onClick={() => handleUpdateMealClick(m._id)}
                    >
                      Edit
                    </button>

                    <button
                      className="px-2 underline text-red-600"
                      onClick={() => setConfirmId(m._id)}
                      disabled={isPending && confirmId === m._id}
                    >
                      {isPending ? "Deleting…" : "Delete"}
                    </button>

                    {confirmId === m._id && (
                      <div
                        data-confirm-for={m._id}
                        className="absolute right-3 top-[5rem] -translate-y-1/2  w-40 rounded-2xl border bg-white p-4 shadow-2xl z-10"
                      >
                        <p className="mb-3 font-semibold">Are you sure?</p>
                        <div className="flex items-center justify-end gap-4">
                          <button
                            className="text-red-600 hover:font-bold"
                            disabled={isPending}
                            onClick={() => {
                              deleteMeal(m._id, {
                                onSettled: () => setConfirmId(null),
                              });
                            }}
                          >
                            Yes
                          </button>
                          <button
                            className="hover:font-bold"
                            onClick={() => setConfirmId(null)}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación simple */}
      <div className="flex items-center justify-between">
        <span className="text-sm opacity-70">
          Page {page} of {Math.max(1, Math.ceil(total / (params.limit ?? 20)))}
        </span>
        <div className="space-x-2">
          <button
            className="rounded border px-3 py-1"
            disabled={page <= 1}
            onClick={() =>
              setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))
            }
          >
            Prev
          </button>
          <button
            className="rounded border px-3 py-1"
            disabled={page >= Math.ceil(total / (params.limit ?? 20))}
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

export default MealsList;
