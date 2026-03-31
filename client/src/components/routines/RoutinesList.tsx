import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Route as RountineDetailsRoute } from "@/routes/routines/routine-details/$routineId";
import { Route as RoutineUpdateRoute } from "@/routes/routines/update/$routineId";
import { useRoutines } from "@/lib/hooks/useRoutines";
import type { IRoutine } from "@/services/routineService";
import { SortOption, SORT_LABEL } from "@/types/types";
import { makeComparator } from "@/lib/helpers/makeComparator";
import assets from "@/assets";
import { FaPlus } from "react-icons/fa6";

const PAGE_SIZE = 20;

const countExercises = (r: IRoutine) =>
  r.blocks?.reduce((acc, b) => acc + (b.exercises?.length ?? 0), 0) ?? 0;

const getTimerModes = (r: IRoutine) => {
  const s = new Set<string>();
  r.blocks?.forEach((b) => {
    if (b.timer?.mode) s.add(b.timer.mode.toUpperCase());
  });
  return Array.from(s);
};

const RoutinesList = () => {
  const [search, setSearch] = React.useState("");
  const [templatesOnly, setTemplatesOnly] = React.useState(false);
  const [includeArchived, setIncludeArchived] = React.useState(false);
  const [sort, setSort] = React.useState<SortOption>("-updatedAt");
  const [page, setPage] = React.useState(1);

  const { routines, isLoading, isFetching } = useRoutines({ includeArchived });

  const navigate = useNavigate();
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = React.useMemo(() => {
    let arr = routines.slice();

    if (debouncedSearch) {
      const re = new RegExp(debouncedSearch, "i");
      arr = arr.filter(
        (r) => re.test(r.name) || r.tags?.some((t) => re.test(t)),
      );
    }
    if (templatesOnly) arr = arr.filter((r) => r.isTemplate === true);
    if (!includeArchived) arr = arr.filter((r) => r.isArchived !== true);

    arr.sort(makeComparator(sort));
    return arr;
  }, [routines, debouncedSearch, templatesOnly, includeArchived, sort]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, templatesOnly, includeArchived, sort]);

  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const total = filtered.length;
  const hasMore = start + PAGE_SIZE < total;

  const handleClickRoutine = (routineId: string) => {
    navigate({ to: RountineDetailsRoute.to, params: { routineId } });
  };

  const handleEditRoutine = (routineId: string) => {
    navigate({ to: RoutineUpdateRoute.to, params: { routineId } });
  };

  return (
    <div className="p-6 pt-24 space-y-6 text-black">
      <header className="flex flex-wrap items-end gap-4">
        <div className="mr-auto">
          <h1 className="text-2xl font-semibold">Routines</h1>
          <p className="text-sm text-neutral-500">
            Plan and track your workouts.
          </p>
        </div>

        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routines…"
            className="rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
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
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 font-medium text-black hover:bg-lime-300"
            >
              <FaPlus className="mr-1" />
              New
            </Link>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white/80 p-6 backdrop-blur">
          Loading…
        </div>
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
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((r) => {
              const exercisesCount = countExercises(r);
              const timerModes = getTimerModes(r);

              return (
                <li
                  key={r._id}
                  className="rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="truncate font-semibold text-neutral-900">
                        {r.name}
                      </h3>
                    </div>

                    <div className="text-sm text-neutral-500 flex flex-wrap gap-3">
                      <span>{r.blocks?.length ?? 0} blocks</span>
                      <span>{exercisesCount} exercises</span>
                      {typeof r.estimatedDurationMin === "number" && (
                        <span>{r.estimatedDurationMin} min</span>
                      )}
                      <span>{r.timesPerformed ?? 0}×</span>
                      <LastPerformed iso={r.lastPerformedAt} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {r.isTemplate && (
                        <Badge className="bg-neutral-100 text-neutral-700">
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
                          key={m}
                          className="bg-purple-100 text-purple-700"
                        >
                          {m}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleClickRoutine(r._id)}
                        className="flex-1 rounded-xl bg-lime-400 px-3 py-2 text-sm font-medium text-black hover:bg-lime-300"
                      >
                        Open
                      </button>

                      <button
                        onClick={() => handleEditRoutine(r._id)}
                        className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 pt-3">
            <button
              className="rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-50 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>

            <button
              className="rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-50 disabled:opacity-50"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>

            <div className="ml-auto text-sm text-neutral-500">
              Page {page} • {total}
              {isFetching && <span> • updating…</span>}
            </div>
          </div>
        </>
      )}

      <div>
        <img src={assets.routine2} alt="routine" className="w-[40rem]" />
      </div>
    </div>
  );
};

function LastPerformed({ iso }: { iso?: string | null }) {
  if (!iso) return <span>—</span>;
  const d = new Date(iso);
  const date = Number.isNaN(d.valueOf()) ? "—" : d.toISOString().slice(0, 10);
  return <span>{date}</span>;
}

function Badge({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${className}`}>
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
    <div className="rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-10 text-center text-neutral-500">
      <div className="text-lg font-medium text-black">No routines found</div>
      <div className="text-sm mt-1">Try adjusting your search or filters.</div>

      {showClear && (
        <button
          onClick={onClear}
          className="mt-4 rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default RoutinesList;
