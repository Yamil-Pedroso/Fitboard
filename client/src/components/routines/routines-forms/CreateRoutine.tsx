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
  cuesStr?: string;
};

type FormBlock = {
  title?: string;
  exerciseType?: ExerciseType;
  rounds?: number | "";
  restBetweenExercisesSec?: number | "";
  timerMode?: TimerMode | "";
  timerSeconds?: number | "";
  exercises: FormExercise[];
};

const CreateRoutine = () => {
  const { mutate, isPending, error } = useCreateRoutine();

  const [form, setForm] = React.useState({
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

  function setBlock(idx: number, updater: (prev: FormBlock) => FormBlock) {
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
    updater: (prev: FormExercise) => FormExercise,
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

    if (!form.name.trim()) return alert("Name is required.");
    const hasAtLeastOneExercise = form.blocks.some(
      (b) => b.exercises && b.exercises.some((ex) => ex.name.trim()),
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
      return n > 0 ? n : undefined;
    }

    const payload = {
      name: form.name.trim(),
      isTemplate: !!form.isTemplate,
      tags: parseTags(form.tagsStr),
      estimatedDurationMin: toIntOrUndef(
        form.estimatedDurationMin as number | "",
      ),
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
          exerciseType: b.exerciseType,
          rounds: toIntOrUndef(b.rounds as number | ""),
          restBetweenExercisesSec: toIntOrUndef(
            b.restBetweenExercisesSec as number | "",
          ),
          timer,
          exercises: b.exercises.map((ex, ei) => ({
            name: ex.name.trim(),
            sets: Math.max(1, Math.round(Number(ex.sets))),
            reps: ex.reps.trim() || "AMRAP",
            restSec: Math.max(0, Math.round(Number(ex.restSec))),
            position: ei + 1,
            loadKg: toPosOrUndef(ex.loadKg as number | ""),
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
              : [],
          })),
        };
      }),
    };

    mutate(payload as any);
  }

  return (
    <div className="w-full p-6 pt-24">
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-6 shadow-sm text-black"
      >
        <h2 className="text-xl font-semibold">Create routine</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block">Name</span>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-lime-200"
              value={form.name}
              onChange={(e) => set("name", e.currentTarget.value)}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block">Estimated duration (min)</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={form.estimatedDurationMin ?? ""}
              onChange={(e) =>
                set(
                  "estimatedDurationMin",
                  e.currentTarget.value === ""
                    ? ""
                    : Number(e.currentTarget.value),
                )
              }
            />
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block">Tags (comma-separated)</span>
            <input
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
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
              <span>Save as template</span>
            </div>
          </label>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Blocks</h3>
            <button
              type="button"
              onClick={addBlock}
              className="rounded-xl border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
            >
              + Add block
            </button>
          </div>

          {form.blocks.map((b, bi) => (
            <div
              key={bi}
              className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Block {bi + 1}</span>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => removeBlock(bi)}
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block">Title</span>
                  <input
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2"
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
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2"
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
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Exercises</span>
                  <button
                    type="button"
                    onClick={() => addExercise(bi)}
                    className="rounded-xl border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
                  >
                    + Add exercise
                  </button>
                </div>

                {b.exercises.map((ex, ei) => (
                  <div
                    key={ei}
                    className="rounded-xl border border-neutral-200 p-3"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <label className="block text-sm sm:col-span-2">
                        <span className="mb-1 block">Name</span>
                        <input
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2"
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
                          className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                          value={ex.sets}
                          onChange={(e) =>
                            setExercise(bi, ei, (p) => ({
                              ...p,
                              sets: Number(e.currentTarget.value),
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div className="mt-3 text-right">
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline"
                        onClick={() => removeExercise(bi, ei)}
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
            {String((error as any)?.message ?? "Error")}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-lime-400 px-4 py-3 font-medium text-black hover:bg-lime-300 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save routine"}
        </button>

        <Link
          to="/routines"
          className="mt-4 text-sm text-neutral-600 hover:underline text-center block"
        >
          Back to routines
        </Link>
      </form>
    </div>
  );
};

export default CreateRoutine;
