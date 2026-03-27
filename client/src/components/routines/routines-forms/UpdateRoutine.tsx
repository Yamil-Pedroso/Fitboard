/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/routines/update/$routineId";
import { useRoutineById, useUpdateRoutine } from "@/lib/hooks/useRoutines";

type ExerciseForm = {
  name: string;
  sets: number | "";
  reps: string;
  restSec: number | "";
  position?: number;
  loadKg?: number | "";
  rir?: number | "";
  tempo?: string;
  notes?: string;
  videoUrl?: string;
  cuesStr?: string;
  cues?: string[];
};

type TimerMode = "countdown" | "emom" | "amrap" | "tabata";

type BlockForm = {
  title?: string;
  position?: number;
  exerciseType?: "strength" | "hypertrophy" | "conditioning" | "mobility";
  rounds?: number | "";
  restBetweenExercisesSec?: number | "";
  timerMode?: TimerMode | "";
  timerSeconds?: number | "";
  exercises: ExerciseForm[];
};

type RoutineForm = {
  name: string;
  isTemplate: boolean;
  tagsStr: string;
  estimatedDurationMin?: number | "";
  blocks: BlockForm[];
};

function parseTags(s: string) {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
function toIntOrUndef(v: number | "" | undefined) {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}
function toPosOrUndef(v: number | "" | undefined) {
  if (v === "" || v == null) return undefined;
  const n = Number(v);
  return n > 0 ? n : undefined;
}

const DEFAULT_EX: ExerciseForm = {
  name: "",
  sets: 3,
  reps: "8-12",
  restSec: 90,
  loadKg: "",
  rir: "",
  tempo: "",
  notes: "",
  videoUrl: "",
  cuesStr: "",
};

const DEFAULT_BLOCK: BlockForm = {
  title: "",
  exerciseType: undefined,
  rounds: "",
  restBetweenExercisesSec: "",
  timerMode: "",
  timerSeconds: "",
  exercises: [DEFAULT_EX],
};

export default function UpdateRoutine() {
  const { routineId } = Route.useParams();
  const {
    data: routine,
    isLoading: isLoadingRoutine,
    error: loadError,
  } = useRoutineById(routineId);
  const { mutate: updateRoutine, isPending, error } = useUpdateRoutine();

  const [form, setForm] = useState<RoutineForm>({
    name: "",
    isTemplate: false,
    tagsStr: "",
    estimatedDurationMin: "",
    blocks: [DEFAULT_BLOCK],
  });

  useEffect(() => {
    if (!routine) return;
    setForm({
      name: routine.name,
      isTemplate: !!routine.isTemplate,
      tagsStr: (routine.tags ?? []).join(", "),
      estimatedDurationMin:
        routine.estimatedDurationMin == null
          ? ""
          : Number(routine.estimatedDurationMin),
      blocks: (routine.blocks ?? []).map((b) => ({
        title: b.title ?? "",
        position: b.position,
        exerciseType: b.exerciseType,
        rounds:
          typeof b.rounds === "number" && Number.isFinite(b.rounds)
            ? b.rounds
            : "",
        restBetweenExercisesSec:
          typeof b.restBetweenExercisesSec === "number" &&
          Number.isFinite(b.restBetweenExercisesSec)
            ? b.restBetweenExercisesSec
            : "",
        timerMode: (b.timer?.mode as TimerMode) ?? "",
        timerSeconds:
          typeof b.timer?.seconds === "number" &&
          Number.isFinite(b.timer?.seconds)
            ? b.timer!.seconds
            : "",
        exercises: (b.exercises ?? []).map((ex) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          restSec: ex.restSec,
          loadKg:
            typeof ex.loadKg === "number" && Number.isFinite(ex.loadKg)
              ? ex.loadKg
              : "",
          rir:
            typeof ex.rir === "number" && Number.isFinite(ex.rir) ? ex.rir : "",
          tempo: ex.tempo ?? "",
          notes: ex.notes ?? "",
          videoUrl: ex.videoUrl ?? "",
          cuesStr: (ex.cues ?? []).join(", "),
          cues: ex.cues ?? [],
        })),
      })),
    });
  }, [routine]);

  function setTop<K extends keyof RoutineForm>(key: K, val: RoutineForm[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }
  function setBlock<K extends keyof BlockForm>(
    idx: number,
    key: K,
    val: BlockForm[K],
  ) {
    setForm((p) => {
      const copy = [...p.blocks];
      copy[idx] = { ...copy[idx], [key]: val };
      return { ...p, blocks: copy };
    });
  }
  function setEx<K extends keyof ExerciseForm>(
    bIdx: number,
    eIdx: number,
    key: K,
    val: ExerciseForm[K],
  ) {
    setForm((p) => {
      const blocks = [...p.blocks];
      const exs = [...blocks[bIdx].exercises];
      exs[eIdx] = { ...exs[eIdx], [key]: val };
      blocks[bIdx] = { ...blocks[bIdx], exercises: exs };
      return { ...p, blocks };
    });
  }

  function addBlock() {
    setForm((p) => ({ ...p, blocks: [...p.blocks, { ...DEFAULT_BLOCK }] }));
  }
  function removeBlock(i: number) {
    setForm((p) => ({ ...p, blocks: p.blocks.filter((_, idx) => idx !== i) }));
  }
  function addExercise(bIdx: number) {
    setForm((p) => {
      const blocks = [...p.blocks];
      blocks[bIdx] = {
        ...blocks[bIdx],
        exercises: [...blocks[bIdx].exercises, { ...DEFAULT_EX }],
      };
      return { ...p, blocks };
    });
  }
  function removeExercise(bIdx: number, eIdx: number) {
    setForm((p) => {
      const blocks = [...p.blocks];
      blocks[bIdx] = {
        ...blocks[bIdx],
        exercises: blocks[bIdx].exercises.filter((_, i) => i !== eIdx),
      };
      return { ...p, blocks };
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      isTemplate: !!form.isTemplate,
      tags: parseTags(form.tagsStr),
      estimatedDurationMin: toIntOrUndef(form.estimatedDurationMin),
      blocks: form.blocks.map((b, bi) => {
        const timer =
          b.timerMode && b.timerSeconds
            ? {
                mode: b.timerMode as TimerMode,
                seconds: Math.max(1, Math.round(Number(b.timerSeconds))),
              }
            : undefined;

        return {
          title: b.title?.trim() || undefined,
          position: bi + 1,
          exerciseType: b.exerciseType || undefined,
          rounds: toIntOrUndef(b.rounds),
          restBetweenExercisesSec: toIntOrUndef(b.restBetweenExercisesSec),
          timer,
          exercises: b.exercises.map((ex, ei) => ({
            name: ex.name.trim(),
            sets: Math.max(1, Math.round(Number(ex.sets || 1))),
            reps: ex.reps.trim() || "AMRAP",
            restSec: Math.max(0, Math.round(Number(ex.restSec || 60))),
            position: ei + 1,
            loadKg: toPosOrUndef(ex.loadKg),
            rir:
              ex.rir === "" || ex.rir == null
                ? undefined
                : Math.max(0, Math.min(10, Math.round(Number(ex.rir)))),
            tempo: ex.tempo?.trim() || undefined,
            notes: ex.notes?.trim() || undefined,
            videoUrl: ex.videoUrl?.trim() || undefined,
            cues: ex.cuesStr
              ? ex.cuesStr
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
              : (ex.cues ?? []),
          })),
        };
      }),
    };

    updateRoutine({ routineId, input: payload });
  }

  const blocksCount = useMemo(() => form.blocks.length, [form.blocks]);

  if (isLoadingRoutine)
    return <div className="p-6 text-black">Loading routine…</div>;
  if (loadError)
    return <div className="p-6 text-red-600">Failed to load routine.</div>;
  if (!routine)
    return <div className="p-6 text-red-600">Routine not found.</div>;

  return (
    <div className="mx-auto w-full max-w-4xl p-6 text-black">
      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-6 shadow-sm"
      >
        <h2 className="text-2xl font-semibold">Edit routine</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" className="sm:col-span-2">
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none  focus:ring-2 focus:ring-lime-200"
              value={form.name}
              onChange={(e) => setTop("name", e.currentTarget.value)}
              required
            />
          </Field>

          <Field label="Estimated duration">
            <input
              type="number"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
              value={form.estimatedDurationMin ?? ""}
              onChange={(e) =>
                setTop(
                  "estimatedDurationMin",
                  e.currentTarget.value === ""
                    ? ""
                    : Number(e.currentTarget.value),
                )
              }
            />
          </Field>

          <Field label="Tags" className="sm:col-span-2">
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
              value={form.tagsStr}
              onChange={(e) => setTop("tagsStr", e.currentTarget.value)}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isTemplate}
              onChange={(e) => setTop("isTemplate", e.currentTarget.checked)}
            />
            Template
          </label>
        </div>

        <div>
          <div className="mb-3 flex justify-between items-center">
            <h2 className="text-lg font-medium">Blocks ({blocksCount})</h2>
            <button
              type="button"
              onClick={addBlock}
              className="rounded-xl bg-lime-400 px-3 py-2 text-black font-medium hover:bg-lime-300"
            >
              + Add block
            </button>
          </div>

          <div className="space-y-5">
            {form.blocks.map((b, bi) => (
              <section
                key={bi}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex justify-between mb-3">
                  <span className="font-medium">Block {bi + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeBlock(bi)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Title" className="sm:col-span-2">
                    <input
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                      value={b.title ?? ""}
                      onChange={(e) =>
                        setBlock(bi, "title", e.currentTarget.value)
                      }
                    />
                  </Field>

                  <Field label="Type">
                    <select
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                      value={b.exerciseType ?? ""}
                      onChange={(e) =>
                        setBlock(
                          bi,
                          "exerciseType",
                          (e.currentTarget.value ||
                            undefined) as BlockForm["exerciseType"],
                        )
                      }
                    >
                      <option value="">—</option>
                      <option value="strength">Strength</option>
                      <option value="hypertrophy">Hypertrophy</option>
                      <option value="conditioning">Conditioning</option>
                      <option value="mobility">Mobility</option>
                    </select>
                  </Field>
                </div>

                <div className="mt-4 space-y-3">
                  {b.exercises.map((ex, ei) => (
                    <div
                      key={ei}
                      className="rounded-xl border border-neutral-200 p-3"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">#{ei + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeExercise(bi, ei)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          className="sm:col-span-2 rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                          value={ex.name}
                          onChange={(e) =>
                            setEx(bi, ei, "name", e.currentTarget.value)
                          }
                        />

                        <input
                          type="number"
                          className="rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
                          value={ex.sets}
                          onChange={(e) =>
                            setEx(
                              bi,
                              ei,
                              "sets",
                              e.currentTarget.value === ""
                                ? ""
                                : Number(e.currentTarget.value),
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{(error as any)?.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-lime-400 px-4 py-3 font-medium text-black hover:bg-lime-300 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>

        <Link
          to="/routines"
          className="block text-center text-sm text-neutral-600 hover:underline mt-3"
        >
          Back to routines
        </Link>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: React.PropsWithChildren<{ label: string; className?: string }>) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block text-neutral-600">{label}</span>
      {children}
    </label>
  );
}
