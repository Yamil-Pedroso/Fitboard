import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Route as UpdateRecipeRoute } from "@/routes/recipes/update/$recipeId";
import { useRecipes, useDeleteRecipe } from "@/lib/hooks/useRecipes";

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
    <div className="p-6">
      {/* Header + acciones */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-black">Recipes</h1>
        <Link
          to="/recipes/create"
          className="inline-flex items-center justify-center rounded bg-black px-4 py-2 text-white hover:opacity-90"
        >
          New recipe
        </Link>
      </div>

      {/* Toolbar de filtros */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          type="text"
          className="w-full rounded border px-3 py-2 text-black"
          placeholder="Search by name or ingredient…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <select
          className="w-full rounded border px-3 py-2 text-black"
          disabled
          title="Coming soon"
        >
          <option>All categories</option>
        </select>
        <select
          className="w-full rounded border px-3 py-2 text-black"
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

      {/* Grid/cards */}
      {isLoading ? (
        <div className="text-black opacity-70">Loading recipes…</div>
      ) : error ? (
        <div className="text-red-600">Failed to load recipes.</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-black">
          <p className="mb-2 text-lg font-medium">No recipes yet</p>
          <p className="mb-4 opacity-70">
            Create your first recipe to start tracking your meals.
          </p>
          <Link
            to="/recipes/create"
            className="inline-flex items-center justify-center rounded bg-black px-4 py-2 text-white hover:opacity-90"
          >
            Create recipe
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => {
            const image =
              // @ts-expect-error optional if you add it later
              recipe.imageUrl || FALLBACK_IMG;
            const servings = recipe.servings ?? 1;
            const ingCount = Array.isArray(recipe.ingredients)
              ? recipe.ingredients.length
              : 0;
            const cats = recipe.categoryIds?.length ? recipe.categoryIds : [];

            return (
              <article
                key={recipe._id}
                className="
                  group relative overflow-hidden rounded-2xl border border-neutral-200
                  bg-white/90 backdrop-blur-sm shadow-sm transition-all
                  hover:-translate-y-0.5 hover:shadow-lg
                "
              >
                {/* cover */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                  {/* subtle texture/glow overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_45%)]" />
                  <img
                    src={image}
                    alt={recipe.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
                    }}
                  />
                </div>

                {/* body */}
                <div className="flex flex-col space-y-3 p-4 text-black">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-1 text-base md:text-lg font-semibold text-neutral-900">
                      {recipe.name}
                    </h3>
                    <span
                      className="
                        shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-xs text-neutral-700
                        ring-1 ring-inset ring-neutral-200 shadow-sm
                      "
                    >
                      {servings} servings
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600">
                    {ingCount} ingredient{ingCount === 1 ? "" : "s"}
                  </p>

                  <ul className="space-y-1 text-sm text-neutral-800">
                    {recipe.ingredients.map((ingredient, i) => (
                      <li
                        key={i}
                        className="truncate before:mr-2 before:content-['•'] before:text-neutral-300"
                      >
                        {ingredient.name}
                      </li>
                    ))}
                  </ul>

                  {/* category chips */}
                  {cats.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {cats.slice(0, 3).map((c: string) => (
                        <span
                          key={c}
                          className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 ring-1 ring-inset ring-neutral-200"
                        >
                          {c}
                        </span>
                      ))}
                      {cats.length > 3 && (
                        <span className="text-xs text-neutral-500">
                          +{cats.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleUpdateRecipeClick(recipe._id)}
                      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-neutral-50"
                    >
                      Edit
                    </button>

                    <button
                      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => setConfirmId(recipe._id)}
                      disabled={isPending && confirmId === recipe._id}
                    >
                      {isPending ? "Deleting…" : "Delete"}
                    </button>

                    {confirmId === recipe._id && (
                      <div
                        data-confirm-for={recipe._id}
                        className="absolute right-3 top-[-3rem] -translate-y-1/2 w-40 rounded-2xl border bg-white p-4 text-neutral-900 shadow-2xl z-10"
                      >
                        <p className="mb-3 font-semibold">Are you sure?</p>
                        <div className="flex items-center justify-end gap-4">
                          <button
                            className="text-red-600 hover:font-bold"
                            disabled={isPending}
                            onClick={() => {
                              deleteRecipe(recipe._id, {
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
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {recipes.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-black">
          <span className="opacity-70">
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              className="rounded border px-3 py-1 disabled:opacity-50"
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
              className="rounded border px-3 py-1 disabled:opacity-50"
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
