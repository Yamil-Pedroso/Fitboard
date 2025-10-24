import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Route } from "@/routes/routines/routine-details/$routineId";
import { useNavigate } from "@tanstack/react-router";
import {
  useRoutine,
  useDeleteRoutine,
  useDuplicateRoutine,
  useArchiveRoutine,
  useUnarchiveRoutine,
  useMarkPerformedRoutine,
} from "@/lib/hooks/useRoutines";
import type { IRoutine } from "@/services/routineService";

import {
  Dumbbell,
  Clock,
  Timer,
  Play,
  Edit,
  MoreVertical,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  RefreshCcw,
  ExternalLink,
  Film,
  X,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

// --- utils ---
const fmtDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(iso)
      )
    : "—";
const fmtDuration = (min?: number) => {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m} min`;
};

// Botón simple Tailwind
const btn = {
  base: "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
  primary: "bg-black text-white hover:bg-black/90",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
  outline: "border border-zinc-300 text-zinc-900 hover:bg-zinc-50",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "hover:bg-zinc-100",
  sm: "px-2.5 py-1.5 text-xs",
};

const Chip: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
    {children}
  </span>
);

const Badge: React.FC<
  React.PropsWithChildren<{ variant?: "outline" | "solid" }>
> = ({ children, variant = "solid" }) => (
  <span
    className={
      variant === "outline"
        ? "inline-flex items-center rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] text-zinc-700"
        : "inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-700"
    }
  >
    {children}
  </span>
);

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div
    className={`rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </div>
);

const Skeleton: React.FC = () => (
  <div className="mx-auto w-full max-w-5xl p-6">
    <div className="mb-4 h-7 w-64 animate-pulse rounded bg-zinc-200" />
    <div className="mb-6 h-4 w-40 animate-pulse rounded bg-zinc-200" />
    <div className="grid gap-4 md:grid-cols-3">
      <div className="h-28 animate-pulse rounded-xl bg-zinc-200" />
      <div className="h-28 animate-pulse rounded-xl bg-zinc-200" />
      <div className="h-28 animate-pulse rounded-xl bg-zinc-200" />
    </div>
    <div className="mt-6 h-72 animate-pulse rounded-2xl bg-zinc-200" />
  </div>
);

// Dropdown minimal sin shadcn
const useOutsideClose = (open: boolean, onClose: () => void) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);
  return ref;
};

const Menu: React.FC<{
  items: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }[];
  open: boolean;
  onClose: () => void;
}> = ({ items, open, onClose }) => {
  const ref = useOutsideClose(open, onClose);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg"
    >
      {items.map((it, i) => (
        <button
          key={i}
          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 ${it.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-800"}`}
          onClick={() => {
            it.onClick();
            onClose();
          }}
        >
          {it.icon}
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
};

// Modal simple sin shadcn
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}> = ({ open, onClose, title, children, footer }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="absolute left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              className={`${btn.ghost} rounded-full p-1`}
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-sm text-zinc-700">{children}</div>
          <div className="mt-4 flex justify-end gap-2">{footer}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const RoutineDetails: React.FC = () => {
  const { routineId } = Route.useParams();
  const navigate = useNavigate();

  const { data: routine, isLoading, error } = useRoutine(routineId);
  const { mutate: delRoutine, isPending: deleting } = useDeleteRoutine();
  const { mutate: duplicate, isPending: duplicating } = useDuplicateRoutine();
  const { mutate: archive, isPending: archiving } = useArchiveRoutine();
  const { mutate: unarchive, isPending: unarchiving } = useUnarchiveRoutine();
  const { mutate: markPerformed, isPending: marking } =
    useMarkPerformedRoutine();

  const [openDelete, setOpenDelete] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  if (isLoading) return <Skeleton />;
  if (error)
    return (
      <div className="mx-auto w-full max-w-5xl p-6 text-red-600">
        Failed to load routine.
      </div>
    );
  if (!routine)
    return (
      <div className="mx-auto w-full max-w-5xl p-6 text-red-600">
        Routine not found.
      </div>
    );

  const onDelete = () => delRoutine(routine._id);
  const onDuplicate = () =>
    duplicate({ routineId: routine._id, name: `${routine.name} (copy)` });
  const onArchiveToggle = () =>
    routine.isArchived ? unarchive(routine._id) : archive(routine._id);
  const onMarkPerformed = () => markPerformed({ routineId: routine._id });

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-700 text-white shadow">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {routine.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
              <Chip>
                <Clock className="h-4 w-4" />{" "}
                {fmtDuration(routine.estimatedDurationMin)}
              </Chip>
              <Chip>
                <RefreshCcw className="h-4 w-4" /> Performed{" "}
                {routine.timesPerformed}×
              </Chip>
              <Chip>
                <Timer className="h-4 w-4" /> Last:{" "}
                {fmtDate(routine.lastPerformedAt || undefined)}
              </Chip>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <button
            className={`${btn.base} ${btn.secondary} ${btn.sm}`}
            onClick={() => navigate({ to: `/routines/${routine._id}/edit` })}
          >
            <Edit className="h-4 w-4" /> Edit
          </button>
          <button
            className={`${btn.base} ${btn.primary} ${btn.sm}`}
            onClick={onMarkPerformed}
            disabled={marking}
          >
            <Play className="h-4 w-4" /> Start / Mark performed
          </button>

          <button
            className={`${btn.base} ${btn.outline} ${btn.sm}`}
            onClick={() => setOpenMenu((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={openMenu}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <Menu
            open={openMenu}
            onClose={() => setOpenMenu(false)}
            items={[
              {
                label: "Duplicate",
                icon: <Copy className="h-4 w-4" />,
                onClick: onDuplicate,
              },
              {
                label: routine.isArchived ? "Unarchive" : "Archive",
                icon: routine.isArchived ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                ),
                onClick: onArchiveToggle,
              },
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => setOpenDelete(true),
                danger: true,
              },
            ]}
          />
        </div>
      </motion.div>

      {/* Tags */}
      {routine.tags?.length ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {routine.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-black">
              Estimated Duration
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {fmtDuration(routine.estimatedDurationMin)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Last Performed
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {fmtDate(routine.lastPerformedAt || undefined)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Times Performed
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {routine.timesPerformed}
            </p>
          </div>
        </Card>
      </div>

      {/* Blocks */}
      <div className="mt-6 space-y-4">
        {routine.blocks?.length ? (
          routine.blocks
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((block) => (
              <Card key={block.position}>
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-3">
                  <h3 className="text-sm font-semibold">
                    {block.title || `Block ${block.position}`}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-600">
                    {block.rounds ? (
                      <span className="inline-flex items-center gap-1">
                        <RefreshCcw className="h-3.5 w-3.5" /> {block.rounds}{" "}
                        rounds
                      </span>
                    ) : null}
                    {typeof block.restBetweenExercisesSec === "number" ? (
                      <span className="inline-flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" /> Rest{" "}
                        {block.restBetweenExercisesSec}s
                      </span>
                    ) : null}
                    {block.timer ? (
                      <span className="inline-flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" /> {block.timer.mode} ·{" "}
                        {block.timer.seconds}s
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="max-h-[420px] divide-y overflow-y-auto">
                  {block.exercises
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((ex) => (
                      <motion.div
                        key={`${block.position}-${ex.position}-${ex.name}`}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-20%" }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-12 sm:gap-3"
                      >
                        {/* main */}
                        <div className="sm:col-span-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{ex.position}</Badge>
                            <p className="font-medium leading-tight">
                              {ex.name}
                            </p>
                          </div>
                          {ex.notes ? (
                            <p className="mt-1 text-xs text-zinc-600">
                              {ex.notes}
                            </p>
                          ) : null}
                        </div>

                        {/* prescription */}
                        <div className="sm:col-span-5">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            <span className="inline-flex items-center gap-1">
                              <Dumbbell className="h-4 w-4" /> {ex.sets} sets
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Play className="h-4 w-4" /> {ex.reps} reps
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Timer className="h-4 w-4" /> Rest {ex.restSec}s
                            </span>
                            {typeof ex.loadKg === "number" ? (
                              <span className="inline-flex items-center gap-1">
                                <Dumbbell className="h-4 w-4" /> {ex.loadKg} kg
                              </span>
                            ) : null}
                            {typeof ex.rir === "number" ? (
                              <span className="inline-flex items-center gap-1">
                                <RefreshCcw className="h-4 w-4" /> RIR {ex.rir}
                              </span>
                            ) : null}
                            {ex.tempo ? (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-4 w-4" /> Tempo {ex.tempo}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* extras */}
                        <div className="sm:col-span-3 flex items-center gap-2">
                          {ex.cues?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {ex.cues.slice(0, 3).map((c) => (
                                <Badge key={c}>{c}</Badge>
                              ))}
                              {ex.cues.length > 3 ? (
                                <Badge variant="outline">
                                  +{ex.cues.length - 3}
                                </Badge>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-500">—</span>
                          )}

                          {ex.videoUrl ? (
                            <a
                              className="ml-auto inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50"
                              href={ex.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Film className="h-3.5 w-3.5" /> Video{" "}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </Card>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center text-zinc-600">
            <Dumbbell className="mb-2 h-7 w-7" />
            <p className="text-sm font-medium text-zinc-800">
              No blocks in this routine
            </p>
            <p className="mt-1 text-xs">
              Add exercises and structure the workout.
            </p>
          </div>
        )}
      </div>

      {/* Modal de borrado */}
      <Modal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete routine?"
        footer={
          <>
            <button
              className={`${btn.base} ${btn.secondary}`}
              onClick={() => setOpenDelete(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              className={`${btn.base} ${btn.danger}`}
              onClick={onDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </>
        }
      >
        This action cannot be undone. The routine "{routine.name}" will be
        permanently removed.
      </Modal>
    </div>
  );
};

export default RoutineDetails;
