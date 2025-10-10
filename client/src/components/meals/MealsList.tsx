import { useState } from "react";
import { useMeals } from "@/lib/hooks/useMeals";
//import { listAllMeals } from "@/services/mealService";

const MealsList = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    sort: "-date" as const,
  });
  const { meals, page, total, isLoading } = useMeals(params);

  return (
    <div className="p-6 space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {/* inputs from/to, slot select, search… y botón Apply */}
        <button
          className="rounded bg-black px-3 py-2 text-white"
          onClick={() => {
            /* abrir modal create */
          }}
        >
          New meal
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded border">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b text-black">
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Slot</th>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">kcal/100</th>
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
                <tr key={m._id} className="border-t text-black">
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
                  <td className="p-2 text-right">
                    <button
                      className="px-2 underline"
                      onClick={() => {
                        /* edit */
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 underline text-red-600"
                      onClick={() => {
                        /* delete */
                      }}
                    >
                      Delete
                    </button>
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
