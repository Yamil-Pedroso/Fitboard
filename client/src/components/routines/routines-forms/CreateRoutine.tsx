/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useCreateRoutine } from "@/lib/hooks/useRoutines";

type ExerciseType = "strength" | "hypertrophy" | "conditioning" | "mobility";
type TimerMode = "countdown" | "emom" | "amrap" | "tabata";

type FormExercise = {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  loadKg?: number | "";
  rir?: number | "";
  tempo?: string;
  notes?: string;
  videoUrl?: string;
  cuesStr?: string; // csv to UI
};

type FormBlock = {
  title?: string;
  exerciseType?: ExerciseType;
  rounds?: number | "";
  restBetweenExercisesSec?: number | "";
  timerMode?: TimerMode | ""; // "" = without timer
  timerSeconds?: number | "";
  exercises: FormExercise[];
};

const CreateRoutine = () => {
  const { mutate, isPending, error } = useCreateRoutine();

  const [form, setForm] = React.useState<{
    name: string;
    isTemplate: boolean;
    estimatedDurationMin?: number | "";
    tagsStr: string; // csv to UI
    blocks: FormBlock[];
  }>({
    name: "",
    isTemplate: false,
    estimatedDurationMin: "",
    tagsStr: "",
    blocks: [
      {
        title: "",
        exerciseType: "strength",
        rounds: "",
        restBetweenExercisesSec: 60,
        timerMode: "",
        timerSeconds: "",
        exercises: [
          {
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
          },
        ],
      },
    ],
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function setBlock(
    idx: number,
    updater: (prev: FormBlock) => FormBlock
  ): void {
    setForm((p) => {
      const blocks = p.blocks.slice();
      blocks[idx] = updater(blocks[idx]);
      return { ...p, blocks };
    });
  }

  function addBlock() {
    setForm((p) => ({
      ...p,
      blocks: [
        ...p.blocks,
        {
          title: "",
          exerciseType: "strength",
          rounds: "",
          restBetweenExercisesSec: 60,
          timerMode: "",
          timerSeconds: "",
          exercises: [
            {
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
            },
          ],
        },
      ],
    }));
  }

  function removeBlock(idx: number) {
    setForm((p) => ({ ...p, blocks: p.blocks.filter((_, i) => i !== idx) }));
  }

  function setExercise(
    blockIdx: number,
    exIdx: number,
    updater: (prev: FormExercise) => FormExercise
  ) {
    setBlock(blockIdx, (b) => {
      const exercises = b.exercises.slice();
      exercises[exIdx] = updater(exercises[exIdx]);
      return { ...b, exercises };
    });
  }

  function addExercise(blockIdx: number) {
    setBlock(blockIdx, (b) => ({
      ...b,
      exercises: [
        ...b.exercises,
        {
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
        },
      ],
    }));
  }

  function removeExercise(blockIdx: number, exIdx: number) {
    setBlock(blockIdx, (b) => ({
      ...b,
      exercises: b.exercises.filter((_, i) => i !== exIdx),
    }));
  }

  function parseTags(csv: string): string[] {
    return csv
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validación básica
    if (!form.name.trim()) return alert("Name is required.");
    const hasAtLeastOneExercise = form.blocks.some(
      (b) => b.exercises && b.exercises.some((ex) => ex.name.trim())
    );
    if (!hasAtLeastOneExercise) {
      return alert("Add at least one exercise with a name.");
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

    // Construir payload para el backend (cumple CreateRoutineDto)
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
            : undefined; // ⚠️ NO mandar null: el DTO lo tiene como opcional

        return {
          title: b.title?.trim() || undefined,
          position: bi + 1,
          exerciseType: b.exerciseType,
          rounds: toIntOrUndef(b.rounds),
          restBetweenExercisesSec: toIntOrUndef(b.restBetweenExercisesSec),
          timer,
          exercises: b.exercises.map((ex, ei) => ({
            name: ex.name.trim(),
            sets: Math.max(1, Math.round(Number(ex.sets))),
            reps: ex.reps.trim() || "AMRAP",
            restSec: Math.max(0, Math.round(Number(ex.restSec))),
            position: ei + 1,
            loadKg: toPosOrUndef(ex.loadKg),
            rir:
              ex.rir === "" || ex.rir == null
                ? undefined
                : Math.max(0, Math.min(10, Math.round(Number(ex.rir)))),
            tempo: ex.tempo?.trim() || undefined,
            notes: ex.notes?.trim() || undefined,
            videoUrl: ex.videoUrl?.trim() || undefined, // opcional: validar que empiece por http
            cues: ex.cuesStr
              ? ex.cuesStr
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
              : [],
          })),
        };
      }),
    };

    mutate(payload as any, {
      onSuccess: () => {
        // tu hook ya navega a /routines en onSuccess; si no, hazlo aquí.
      },
    });
  }

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="w-full mx-auto max-w-3xl space-y-5 rounded-2xl border p-6 text-black"
      >
        <h2 className="text-lg font-semibold">Create routine</h2>

        {/* Base */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block">Name</span>
            <input
              className="w-full rounded border px-3 py-2"
              value={form.name}
              onChange={(e) => set("name", e.currentTarget.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Estimated duration (min)</span>
            <input
              type="number"
              min={1}
              className="w-full rounded border px-3 py-2"
              value={form.estimatedDurationMin ?? ""}
              onChange={(e) =>
                set(
                  "estimatedDurationMin",
                  e.currentTarget.value === ""
                    ? ""
                    : Number(e.currentTarget.value)
                )
              }
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block">Tags (comma-separated)</span>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="legs, strength, home"
              value={form.tagsStr}
              onChange={(e) => set("tagsStr", e.currentTarget.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Template</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isTemplate}
                onChange={(e) => set("isTemplate", e.currentTarget.checked)}
              />
              <span className="text-sm">Save as template</span>
            </div>
          </label>
        </div>

        {/* Blocks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Blocks</h3>
            <button
              type="button"
              onClick={addBlock}
              className="rounded border px-3 py-1.5 hover:bg-neutral-50"
            >
              + Add block
            </button>
          </div>

          {form.blocks.map((b, bi) => (
            <div key={bi} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Block {bi + 1}</div>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-red-600 hover:bg-red-50"
                  onClick={() => removeBlock(bi)}
                  disabled={form.blocks.length <= 1}
                  title={
                    form.blocks.length <= 1
                      ? "At least one block"
                      : "Remove block"
                  }
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block">Title</span>
                  <input
                    className="w-full rounded border px-3 py-2"
                    value={b.title ?? ""}
                    onChange={(e) =>
                      setBlock(bi, (prev) => ({
                        ...prev,
                        title: e.currentTarget.value,
                      }))
                    }
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block">Type</span>
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={b.exerciseType ?? ""}
                    onChange={(e) =>
                      setBlock(bi, (prev) => ({
                        ...prev,
                        exerciseType: e.currentTarget.value as ExerciseType,
                      }))
                    }
                  >
                    <option value="strength">Strength</option>
                    <option value="hypertrophy">Hypertrophy</option>
                    <option value="conditioning">Conditioning</option>
                    <option value="mobility">Mobility</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block">Rounds</span>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded border px-3 py-2"
                    value={b.rounds ?? ""}
                    onChange={(e) =>
                      setBlock(bi, (prev) => ({
                        ...prev,
                        rounds:
                          e.currentTarget.value === ""
                            ? ""
                            : Number(e.currentTarget.value),
                      }))
                    }
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block">
                    Rest between exercises (sec)
                  </span>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded border px-3 py-2"
                    value={b.restBetweenExercisesSec ?? ""}
                    onChange={(e) =>
                      setBlock(bi, (prev) => ({
                        ...prev,
                        restBetweenExercisesSec:
                          e.currentTarget.value === ""
                            ? ""
                            : Number(e.currentTarget.value),
                      }))
                    }
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block">Timer</span>
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={b.timerMode ?? ""}
                    onChange={(e) =>
                      setBlock(bi, (prev) => ({
                        ...prev,
                        timerMode: e.currentTarget.value as TimerMode | "",
                      }))
                    }
                  >
                    <option value="">None</option>
                    <option value="countdown">Countdown</option>
                    <option value="emom">EMOM</option>
                    <option value="amrap">AMRAP</option>
                    <option value="tabata">Tabata</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block">Timer seconds</span>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded border px-3 py-2"
                    value={b.timerSeconds ?? ""}
                    onChange={(e) =>
                      setBlock(bi, (prev) => ({
                        ...prev,
                        timerSeconds:
                          e.currentTarget.value === ""
                            ? ""
                            : Number(e.currentTarget.value),
                      }))
                    }
                  />
                </label>
              </div>

              {/* Exercises */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Exercises</div>
                  <button
                    type="button"
                    onClick={() => addExercise(bi)}
                    className="rounded border px-3 py-1.5 hover:bg-neutral-50"
                  >
                    + Add exercise
                  </button>
                </div>

                {b.exercises.map((ex, ei) => (
                  <div key={ei} className="rounded-lg border p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <label className="block text-sm sm:col-span-2">
                        <span className="mb-1 block">Name</span>
                        <input
                          className="w-full rounded border px-3 py-2"
                          value={ex.name}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              name: e.currentTarget.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block">Sets</span>
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded border px-3 py-2"
                          value={ex.sets}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              sets: Number(e.currentTarget.value),
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block">Reps</span>
                        <input
                          className="w-full rounded border px-3 py-2"
                          placeholder='e.g. "8-12" or "AMRAP"'
                          value={ex.reps}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              reps: e.currentTarget.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block">Rest (sec)</span>
                        <input
                          type="number"
                          min={0}
                          className="w-full rounded border px-3 py-2"
                          value={ex.restSec}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              restSec: Number(e.currentTarget.value),
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block">Load (kg)</span>
                        <input
                          type="number"
                          step="any"
                          min={0}
                          className="w-full rounded border px-3 py-2"
                          value={ex.loadKg ?? ""}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              loadKg:
                                e.currentTarget.value === ""
                                  ? ""
                                  : Number(e.currentTarget.value),
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block">RIR</span>
                        <input
                          type="number"
                          step="1"
                          min={0}
                          max={10}
                          className="w-full rounded border px-3 py-2"
                          value={ex.rir ?? ""}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              rir:
                                e.currentTarget.value === ""
                                  ? ""
                                  : Number(e.currentTarget.value),
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block">Tempo</span>
                        <input
                          className="w-full rounded border px-3 py-2"
                          placeholder="e.g. 3-1-1"
                          value={ex.tempo ?? ""}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              tempo: e.currentTarget.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm sm:col-span-3">
                        <span className="mb-1 block">Notes</span>
                        <input
                          className="w-full rounded border px-3 py-2"
                          value={ex.notes ?? ""}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              notes: e.currentTarget.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm sm:col-span-2">
                        <span className="mb-1 block">Video URL</span>
                        <input
                          className="w-full rounded border px-3 py-2"
                          value={ex.videoUrl ?? ""}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              videoUrl: e.currentTarget.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block">
                          Cues (comma-separated)
                        </span>
                        <input
                          className="w-full rounded border px-3 py-2"
                          placeholder="brace, neutral spine"
                          value={ex.cuesStr ?? ""}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              cuesStr: e.currentTarget.value,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-red-600 hover:bg-red-50"
                        onClick={() => removeExercise(bi, ei)}
                        disabled={form.blocks[bi].exercises.length <= 1}
                        title={
                          form.blocks[bi].exercises.length <= 1
                            ? "At least one exercise"
                            : "Remove exercise"
                        }
                      >
                        Remove exercise
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {String((error as any)?.message ?? "Could not create routine")}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save routine"}
        </button>
      </form>

      <Link to="/routines" className="text-black underline underline-offset-1">
        Back to routines
      </Link>
    </div>
  );
};

export default CreateRoutine;
