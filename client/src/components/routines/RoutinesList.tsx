/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Route as RountineDetailsRoute } from "@/routes/routines/routine-details/$routineId";
import { Route as RoutineUpdateRoute } from "@/routes/routines/update/$routineId";
import { useRoutines } from "@/lib/hooks/useRoutines"; // <- no-params version
import type { IRoutine } from "@/services/routineService";
import { SortOption, SORT_LABEL } from "@/types/types";
import { makeComparator } from "@/lib/helpers/makeComparator";
import assets from "@/assets";

const PAGE_SIZE = 20;

/** ---- helpers de propiedades internas ---- */
const countExercises = (r: IRoutine) =>
  r.blocks?.reduce((acc, b) => acc + (b.exercises?.length ?? 0), 0) ?? 0;

const getTimerModes = (r: IRoutine) => {
  const s = new Set<string>();
  r.blocks?.forEach((b) => {
    if (b.timer?.mode) s.add(b.timer.mode.toUpperCase()); // EMOM / AMRAP / TABATA / COUNTDOWN
  });
  return Array.from(s);
};

const RoutinesList = () => {
  const [search, setSearch] = React.useState("");
  const [templatesOnly, setTemplatesOnly] = React.useState(false);
  const [includeArchived, setIncludeArchived] = React.useState(false);
  const [sort, setSort] = React.useState<SortOption>("-updatedAt");
  const [page, setPage] = React.useState(1);

  // Fetch all routines once (no query params)
  const { routines, isLoading, isFetching } = useRoutines({ includeArchived });

  const navigate = useNavigate();

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Client-side filter + sort
  const filtered = React.useMemo(() => {
    let arr = routines.slice();

    if (debouncedSearch) {
      const re = new RegExp(debouncedSearch, "i");
      arr = arr.filter(
        (r) => re.test(r.name) || r.tags?.some((t) => re.test(t))
      );
    }
    if (templatesOnly) arr = arr.filter((r) => r.isTemplate === true);
    if (!includeArchived) arr = arr.filter((r) => r.isArchived !== true);

    arr.sort(makeComparator(sort));
    return arr;
  }, [routines, debouncedSearch, templatesOnly, includeArchived, sort]);

  // Reset to page 1 when filters/sort change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, templatesOnly, includeArchived, sort]);

  // Client-side pagination
  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const total = filtered.length;
  const hasMore = start + PAGE_SIZE < total;

  const handleClickRoutine = (routineId: string) => {
    navigate({
      to: RountineDetailsRoute.to,
      params: { routineId },
    });
  };

  const handleEditRoutine = (routineId: string) => {
    navigate({
      to: RoutineUpdateRoute.to,
      params: { routineId },
    });
  };

  return (
    <div className="p-6 space-y-5 text-black">
      <header className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-semibold">Routines</h1>
          <p className="text-sm text-neutral-500">
            Plan, duplicate, archive and track your workouts.
          </p>
        </div>

        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routines…"
            className="border rounded-xl px-3 py-2 w-full"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="border rounded-xl px-3 py-2"
            aria-label="Sort routines"
          >
            {Object.entries(SORT_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-4 sm:col-span-2 md:col-span-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={templatesOnly}
                onChange={(e) => setTemplatesOnly(e.target.checked)}
              />
              Templates
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
              />
              Archived
            </label>

            <Link
              to="/routines/create"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-white hover:opacity-90"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <path
                  fill="currentColor"
                  d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z"
                />
              </svg>
              New routine
            </Link>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-xl border p-6">Loading…</div>
      ) : visible.length === 0 ? (
        <EmptyState
          showClear={!!(debouncedSearch || templatesOnly || includeArchived)}
          onClear={() => {
            setSearch("");
            setTemplatesOnly(false);
            setIncludeArchived(false);
            setSort("-updatedAt");
          }}
        />
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((r) => {
              const exercisesCount = countExercises(r);
              const timerModes = getTimerModes(r);
              return (
                <li
                  key={r._id}
                  className="border rounded-2xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to="/"
                        params={{ id: r._id }}
                        className="font-medium hover:underline block truncate"
                        title={r.name}
                      >
                        {r.name}
                      </Link>

                      {/* Línea informativa con props internas */}
                      <div className="text-sm text-neutral-600 mt-1 flex flex-wrap gap-3">
                        <span>{r.blocks?.length ?? 0} blocks</span>
                        <span>{exercisesCount} exercises</span>
                        {typeof r.estimatedDurationMin === "number" && (
                          <span>{r.estimatedDurationMin} min</span>
                        )}
                        <span>Done {r.timesPerformed ?? 0}×</span>
                        <LastPerformed iso={r.lastPerformedAt} />
                      </div>

                      {/* Badges: flags + tags + modos de timer + títulos de 1–2 bloques */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {r.isTemplate && (
                          <Badge className="bg-neutral-200 text-neutral-700">
                            Template
                          </Badge>
                        )}
                        {r.isArchived && (
                          <Badge className="bg-amber-100 text-amber-700">
                            Archived
                          </Badge>
                        )}
                        {r.tags?.slice(0, 3).map((t) => (
                          <Badge key={t} className="bg-sky-100 text-sky-700">
                            {t}
                          </Badge>
                        ))}

                        {timerModes.map((m) => (
                          <Badge
                            key={`mode-${m}`}
                            className="bg-purple-100 text-purple-700"
                          >
                            {m}
                          </Badge>
                        ))}

                        {r.blocks?.slice(0, 2).map((b) => (
                          <Badge
                            key={`b-${b.position}`}
                            className="bg-neutral-100 text-neutral-700"
                          >
                            {b.title || `Block ${b.position}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleClickRoutine(r._id)}
                      className="shrink-0 px-3 py-2 rounded-xl  bg-emerald-300 text-black hover:opacity-90 cursor-pointer"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => handleEditRoutine(r._id)}
                      className="shrink-0 px-3 py-2 rounded-xl  bg-blue-300 text-black hover:opacity-90 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="flex items-center gap-2 pt-3">
            <button
              className="px-3 py-2 rounded-xl border hover:bg-neutral-50 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="px-3 py-2 rounded-xl border hover:bg-neutral-50 disabled:opacity-50"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
            <div className="ml-auto text-sm text-neutral-500">
              Page {page} • {total} total{" "}
              {isFetching && <span>• updating…</span>}
            </div>
          </div>
        </>
      )}

      <div>
        <img src={assets.routine2} alt="routine one" className="w-[40rem]" />
      </div>
    </div>
  );
};

function LastPerformed({ iso }: { iso?: string | null }) {
  if (!iso) return <span>Last —</span>;
  const d = new Date(iso);
  const date = Number.isNaN(d.valueOf()) ? "—" : d.toISOString().slice(0, 10);
  return <span>Last {date}</span>;
}

function Badge({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${className}`}>
      {children}
    </span>
  );
}

function EmptyState({
  showClear,
  onClear,
}: {
  showClear: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border p-10 text-center text-neutral-600">
      <div className="text-lg font-medium">No routines found</div>
      <div className="text-sm mt-1">Try adjusting your search or filters.</div>
      {showClear && (
        <button
          onClick={onClear}
          className="mt-4 px-3 py-2 rounded-xl border hover:bg-neutral-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default RoutinesList;
