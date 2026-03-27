import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Route as UpdateRecipeRoute } from "@/routes/recipes/update/$recipeId";
import { useRecipes, useDeleteRecipe } from "@/lib/hooks/useRecipes";
import { FaPlus } from "react-icons/fa6";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop";

const RecipesList = () => {
  const [search, setSearch] = useState("");

  const { mutate: deleteRecipe, isPending } = useDeleteRecipe();
  const navigate = useNavigate();

  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    sort: "-name" as const,
    q: "" as string | undefined,
  });

  const { recipes, page, total, isLoading, error } = useRecipes(params);
  const totalPages = Math.max(1, Math.ceil(total / (params.limit ?? 12)));

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

  useEffect(() => {
    const id = setTimeout(() => {
      setParams((p) => ({
        ...p,
        page: 1,
        q: search.trim() ? search.trim() : undefined,
      }));
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const filtered = useMemo(() => {
    const txt = search.trim().toLowerCase();
    if (!txt) return recipes;

    return recipes.filter((r) => {
      const matchName = r.name?.toLowerCase().includes(txt);
      const matchIngredient = Array.isArray(r.ingredients)
        ? r.ingredients.some((ing) => ing.name?.toLowerCase().includes(txt))
        : false;
      return matchName || matchIngredient;
    });
  }, [recipes, search]);

  const handleUpdateRecipeClick = (recipeId: string) => {
    navigate({ to: UpdateRecipeRoute.to, params: { recipeId } });
  };

  return (
    <div className="p-6 space-y-6 text-black">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Recipes</h1>

        <Link
          to="/recipes/create"
          className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-4 py-2 font-medium text-black hover:bg-lime-300"
        >
          <FaPlus className="mr-2" />
          New recipe
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
          placeholder="Search by name or ingredient…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <select
          className="w-full rounded-xl border border-neutral-300 px-3 py-2"
          disabled
        >
          <option>All categories</option>
        </select>

        <select
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
          value={params.sort}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setParams((p) => ({
              ...p,
              sort: e.target.value as typeof p.sort,
            }))
          }
        >
          <option value="-name">Name (A→Z)</option>
          <option value="name">Name (Z→A)</option>
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-neutral-500">Loading recipes…</div>
      ) : error ? (
        <div className="text-red-600">Failed to load recipes.</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-8 text-center">
          <p className="mb-2 text-lg font-medium">No recipes yet</p>
          <p className="mb-4 text-neutral-500">
            Create your first recipe to get started.
          </p>
          <Link
            to="/recipes/create"
            className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-4 py-2 font-medium text-black hover:bg-lime-300"
          >
            Create recipe
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => {
            const image =
              // @ts-expect-error optional
              recipe.imageUrl || FALLBACK_IMG;

            const servings = recipe.servings ?? 1;
            const ingCount = Array.isArray(recipe.ingredients)
              ? recipe.ingredients.length
              : 0;
            const cats = recipe.categoryIds?.length ? recipe.categoryIds : [];

            return (
              <article
                key={recipe._id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm hover:shadow-lg transition"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  <img
                    src={image}
                    alt={recipe.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                    }}
                  />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between gap-2">
                    <h3 className="truncate font-semibold text-neutral-900">
                      {recipe.name}
                    </h3>

                    <span className="text-xs rounded-full bg-neutral-100 px-2 py-0.5">
                      {servings} servings
                    </span>
                  </div>

                  <p className="text-sm text-neutral-500">
                    {ingCount} ingredient{ingCount === 1 ? "" : "s"}
                  </p>

                  <ul className="text-sm space-y-1">
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i} className="truncate text-neutral-700">
                        • {ingredient.name}
                      </li>
                    ))}
                  </ul>

                  {cats.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cats.slice(0, 3).map((c: string) => (
                        <span
                          key={c}
                          className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs"
                        >
                          {c}
                        </span>
                      ))}
                      {cats.length > 3 && (
                        <span className="text-xs text-neutral-500">
                          +{cats.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative flex justify-between pt-2">
                    <button
                      onClick={() => handleUpdateRecipeClick(recipe._id)}
                      className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm hover:bg-neutral-50"
                    >
                      Edit
                    </button>

                    <button
                      className="rounded-lg border border-red-200 px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => setConfirmId(recipe._id)}
                      disabled={isPending && confirmId === recipe._id}
                    >
                      {isPending ? "Deleting…" : "Delete"}
                    </button>

                    {confirmId === recipe._id && (
                      <div
                        data-confirm-for={recipe._id}
                        className="absolute right-0 top-[-3.5rem] w-44 rounded-2xl border border-neutral-200 bg-white/90 backdrop-blur p-4 shadow-xl z-10"
                      >
                        <p className="mb-2 font-semibold">Delete recipe?</p>

                        <div className="flex justify-end gap-3 text-sm">
                          <button
                            className="hover:underline"
                            onClick={() => setConfirmId(null)}
                          >
                            Cancel
                          </button>

                          <button
                            className="text-red-600 hover:underline"
                            disabled={isPending}
                            onClick={() => {
                              deleteRecipe(recipe._id, {
                                onSettled: () => setConfirmId(null),
                              });
                            }}
                          >
                            {isPending ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {recipes.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              className="rounded-xl border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() =>
                setParams((p) => ({
                  ...p,
                  page: Math.max(1, (p.page ?? 1) - 1),
                }))
              }
            >
              Prev
            </button>

            <button
              className="rounded-xl border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() =>
                setParams((p) => ({
                  ...p,
                  page: Math.min(totalPages, (p.page ?? 1) + 1),
                }))
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesList;
