/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/routines/update/$routineId";
import { useRoutineById, useUpdateRoutine } from "@/lib/hooks/useRoutines";

// ---- Tipos locales para el form ----
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
  cuesStr?: string; // editable en UI (comma-separated)
  cues?: string[]; // por si traes del backend
};

type TimerMode = "countdown" | "emom" | "amrap" | "tabata";

type BlockForm = {
  title?: string;
  position?: number;
  exerciseType?: "strength" | "hypertrophy" | "conditioning" | "mobility";
  rounds?: number | "";
  restBetweenExercisesSec?: number | "";
  timerMode?: TimerMode | ""; // UI
  timerSeconds?: number | ""; // UI
  exercises: ExerciseForm[];
};

type RoutineForm = {
  name: string;
  isTemplate: boolean;
  tagsStr: string; // "push, legs"
  estimatedDurationMin?: number | "";
  blocks: BlockForm[];
};

// ---- Helpers de parse/format ----
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
  return n > 0 ? n : undefined; // loadKg debe ser positive()
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

  // ---- Estado del form ----
  const [form, setForm] = useState<RoutineForm>({
    name: "",
    isTemplate: false,
    tagsStr: "",
    estimatedDurationMin: "",
    blocks: [DEFAULT_BLOCK],
  });

  // Inicializa cuando llega la rutina
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

  // ---- Setters simples ----
  function setTop<K extends keyof RoutineForm>(key: K, val: RoutineForm[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }
  function setBlock<K extends keyof BlockForm>(
    idx: number,
    key: K,
    val: BlockForm[K]
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
    val: ExerciseForm[K]
  ) {
    setForm((p) => {
      const blocks = [...p.blocks];
      const exs = [...blocks[bIdx].exercises];
      exs[eIdx] = { ...exs[eIdx], [key]: val };
      blocks[bIdx] = { ...blocks[bIdx], exercises: exs };
      return { ...p, blocks };
    });
  }

  // ---- Añadir/Quitar ----
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

  // ---- Submit ----
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    // Construir payload que respeta el UpdateRoutineDto (partial)
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
            : undefined; // Importante: no mandar null

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

  // ---- UI ----
  const blocksCount = useMemo(() => form.blocks.length, [form.blocks]);

  if (isLoadingRoutine)
    return <div className="p-6 text-black">Loading routine…</div>;
  if (loadError)
    return <div className="p-6 text-red-600">Failed to load routine.</div>;
  if (!routine)
    return <div className="p-6 text-red-600">Routine not found.</div>;

  return (
    <div className="mx-auto w-full max-w-4xl p-6 text-black">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit routine</h1>
        <Link to="/routines" className="underline">
          Back to routines
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border bg-white p-6 shadow-sm"
      >
        {/* Básicos */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name" className="sm:col-span-2">
            <input
              className="w-full rounded border px-3 py-2"
              value={form.name}
              onChange={(e) => setTop("name", e.currentTarget.value)}
              required
            />
          </Field>

          <Field label="Estimated duration (min)">
            <input
              type="number"
              min={1}
              step={1}
              className="w-full rounded border px-3 py-2"
              value={form.estimatedDurationMin ?? ""}
              onChange={(e) =>
                setTop(
                  "estimatedDurationMin",
                  e.currentTarget.value === ""
                    ? ""
                    : Number(e.currentTarget.value)
                )
              }
            />
          </Field>

          <Field label="Tags (comma separated)" className="sm:col-span-2">
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="push, legs, conditioning"
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

        {/* Blocks */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Blocks <span className="opacity-60">({blocksCount})</span>
            </h2>
            <button
              type="button"
              onClick={addBlock}
              className="rounded bg-black px-3 py-2 text-white"
            >
              + Add block
            </button>
          </div>

          {blocksCount === 0 ? (
            <p className="text-sm opacity-70">No blocks yet.</p>
          ) : (
            <div className="space-y-5">
              {form.blocks.map((b, bi) => (
                <section key={bi} className="rounded-xl border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium">Block #{bi + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeBlock(bi)}
                      className="text-sm text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Title" className="sm:col-span-2">
                      <input
                        className="w-full rounded border px-3 py-2"
                        value={b.title ?? ""}
                        onChange={(e) =>
                          setBlock(bi, "title", e.currentTarget.value)
                        }
                      />
                    </Field>

                    <Field label="Type">
                      <select
                        className="w-full rounded border px-3 py-2"
                        value={b.exerciseType ?? ""}
                        onChange={(e) =>
                          setBlock(
                            bi,
                            "exerciseType",
                            (e.currentTarget.value ||
                              undefined) as BlockForm["exerciseType"]
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

                    <Field label="Rounds">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        className="w-full rounded border px-3 py-2"
                        value={b.rounds ?? ""}
                        onChange={(e) =>
                          setBlock(
                            bi,
                            "rounds",
                            e.currentTarget.value === ""
                              ? ""
                              : Number(e.currentTarget.value)
                          )
                        }
                      />
                    </Field>

                    <Field label="Rest between exercises (sec)">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="w-full rounded border px-3 py-2"
                        value={b.restBetweenExercisesSec ?? ""}
                        onChange={(e) =>
                          setBlock(
                            bi,
                            "restBetweenExercisesSec",
                            e.currentTarget.value === ""
                              ? ""
                              : Number(e.currentTarget.value)
                          )
                        }
                      />
                    </Field>

                    <div className="grid gap-3 sm:grid-cols-2 sm:col-span-2">
                      <Field label="Timer mode">
                        <select
                          className="w-full rounded border px-3 py-2"
                          value={b.timerMode ?? ""}
                          onChange={(e) =>
                            setBlock(
                              bi,
                              "timerMode",
                              (e.currentTarget.value || "") as TimerMode | ""
                            )
                          }
                        >
                          <option value="">—</option>
                          <option value="countdown">Countdown</option>
                          <option value="emom">EMOM</option>
                          <option value="amrap">AMRAP</option>
                          <option value="tabata">Tabata</option>
                        </select>
                      </Field>
                      <Field label="Timer seconds">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          className="w-full rounded border px-3 py-2"
                          value={b.timerSeconds ?? ""}
                          onChange={(e) =>
                            setBlock(
                              bi,
                              "timerSeconds",
                              e.currentTarget.value === ""
                                ? ""
                                : Number(e.currentTarget.value)
                            )
                          }
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Exercises */}
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">
                        Exercises{" "}
                        <span className="opacity-60">
                          ({b.exercises?.length ?? 0})
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => addExercise(bi)}
                        className="rounded border px-3 py-1.5"
                      >
                        + Add exercise
                      </button>
                    </div>

                    {(b.exercises ?? []).length === 0 ? (
                      <p className="text-sm opacity-70">No exercises yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {b.exercises.map((ex, ei) => (
                          <div key={ei} className="rounded-lg border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium">
                                #{ei + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeExercise(bi, ei)}
                                className="text-xs text-red-600 underline"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <Field label="Name" className="sm:col-span-2">
                                <input
                                  className="w-full rounded border px-3 py-2"
                                  value={ex.name}
                                  onChange={(e) =>
                                    setEx(bi, ei, "name", e.currentTarget.value)
                                  }
                                  required
                                />
                              </Field>

                              <Field label="Sets">
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  className="w-full rounded border px-3 py-2"
                                  value={ex.sets}
                                  onChange={(e) =>
                                    setEx(
                                      bi,
                                      ei,
                                      "sets",
                                      e.currentTarget.value === ""
                                        ? ""
                                        : Number(e.currentTarget.value)
                                    )
                                  }
                                />
                              </Field>

                              <Field label="Reps">
                                <input
                                  className="w-full rounded border px-3 py-2"
                                  placeholder="8-12, AMRAP, 10/side…"
                                  value={ex.reps}
                                  onChange={(e) =>
                                    setEx(bi, ei, "reps", e.currentTarget.value)
                                  }
                                />
                              </Field>

                              <Field label="Rest (sec)">
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  className="w-full rounded border px-3 py-2"
                                  value={ex.restSec}
                                  onChange={(e) =>
                                    setEx(
                                      bi,
                                      ei,
                                      "restSec",
                                      e.currentTarget.value === ""
                                        ? ""
                                        : Number(e.currentTarget.value)
                                    )
                                  }
                                />
                              </Field>

                              <Field label="Load (kg)">
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  className="w-full rounded border px-3 py-2"
                                  value={ex.loadKg ?? ""}
                                  onChange={(e) =>
                                    setEx(
                                      bi,
                                      ei,
                                      "loadKg",
                                      e.currentTarget.value === ""
                                        ? ""
                                        : Number(e.currentTarget.value)
                                    )
                                  }
                                />
                              </Field>

                              <Field label="RIR (0–10)">
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  step={1}
                                  className="w-full rounded border px-3 py-2"
                                  value={ex.rir ?? ""}
                                  onChange={(e) =>
                                    setEx(
                                      bi,
                                      ei,
                                      "rir",
                                      e.currentTarget.value === ""
                                        ? ""
                                        : Number(e.currentTarget.value)
                                    )
                                  }
                                />
                              </Field>

                              <Field label="Tempo (optional)">
                                <input
                                  className="w-full rounded border px-3 py-2"
                                  placeholder="3-1-1, 2-0-2…"
                                  value={ex.tempo ?? ""}
                                  onChange={(e) =>
                                    setEx(
                                      bi,
                                      ei,
                                      "tempo",
                                      e.currentTarget.value
                                    )
                                  }
                                />
                              </Field>

                              <Field
                                label="Notes (optional)"
                                className="sm:col-span-2"
                              >
                                <input
                                  className="w-full rounded border px-3 py-2"
                                  value={ex.notes ?? ""}
                                  onChange={(e) =>
                                    setEx(
                                      bi,
                                      ei,
                                      "notes",
                                      e.currentTarget.value
                                    )
                                  }
                                />
                              </Field>

                              <Field label="Video URL (optional)">
                                <input
                                  className="w-full rounded border px-3 py-2"
                                  value={ex.videoUrl ?? ""}
                                  onChange={(e) =>
                                    setEx(
                                      bi,
                                      ei,
                                      "videoUrl",
                                      e.currentTarget.value
                                    )
                                  }
                                />
                              </Field>

                              <Field
                                label="Cues (comma separated)"
                                className="sm:col-span-2"
                              >
                                <input
                                  className="w-full rounded border px-3 py-2"
                                  placeholder="brace core, chest up, drive heels"
                                  value={ex.cuesStr ?? ""}
                                  onChange={(e) =>
                                    setEx(
                                      bi,
                                      ei,
                                      "cuesStr",
                                      e.currentTarget.value
                                    )
                                  }
                                />
                              </Field>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {(error as any)?.response?.data?.error || (error as any)?.message}
          </p>
        )}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---- UI helpers ----
function Field({
  label,
  children,
  className = "",
}: React.PropsWithChildren<{ label: string; className?: string }>) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
