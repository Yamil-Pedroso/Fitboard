/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Route } from "@/routes/routines/routine-details/$routineId";
import { useNavigate } from "@tanstack/react-router";
import {
  useRoutineById,
  useDeleteRoutine,
  useDuplicateRoutine,
  useArchiveRoutine,
  useUnarchiveRoutine,
  useMarkPerformedRoutine,
} from "@/lib/hooks/useRoutines";
import type { IRoutineBlock } from "@/services/routineService";

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
  Flame,
  Activity,
  Move,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

const fmtDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(iso),
      )
    : "—";

const fmtDuration = (min?: number) => {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m} min`;
};

const btn = {
  base: "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
  primary: "bg-lime-400 text-black hover:bg-lime-300 shadow-sm",
  secondary: "bg-white/70 backdrop-blur border border-black/10 hover:bg-white",
  outline: "border border-black/10 bg-white/60 backdrop-blur hover:bg-white",
  danger: "bg-red-500 text-white hover:bg-red-400",
  ghost: "hover:bg-black/5",
  sm: "px-2.5 py-1.5 text-xs",
};

const Chip: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs text-white">
    {children}
  </span>
);

const Badge: React.FC<
  React.PropsWithChildren<{ variant?: "outline" | "solid" }>
> = ({ children, variant = "solid" }) => (
  <span
    className={
      variant === "outline"
        ? "inline-flex items-center rounded border border-black/20 px-1.5 py-0.5 text-[10px]"
        : "inline-flex items-center rounded bg-black/10 px-1.5 py-0.5 text-[10px]"
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
    className={`rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl shadow-sm text-black ${className}`}
  >
    {children}
  </div>
);

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

const Menu: React.FC<any> = ({ items, open, onClose }) => {
  const ref = useOutsideClose(open, onClose);
  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-lg"
    >
      {items.map((it: any, i: number) => (
        <button
          key={i}
          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black/5 ${
            it.danger ? "text-red-500" : ""
          }`}
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

const Modal: React.FC<any> = ({ open, onClose, title, children, footer }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-40">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-xl text-black">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="text-sm">{children}</div>

          <div className="mt-4 flex justify-end gap-2">{footer}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const BLOCK_THEMES = [
  "from-lime-500 to-emerald-400",
  "from-sky-500 to-cyan-400",
  "from-violet-500 to-fuchsia-500",
  "from-orange-500 to-rose-500",
];

const getBlockIcon = (block: IRoutineBlock) => {
  switch (block.exerciseType) {
    case "strength":
      return Dumbbell;
    case "hypertrophy":
      return Activity;
    case "conditioning":
      return Flame;
    case "mobility":
      return Move;
    default:
      return Dumbbell;
  }
};

const RoutineDetails: React.FC = () => {
  const { routineId } = Route.useParams();
  const navigate = useNavigate();

  const { data: routine, isLoading, error } = useRoutineById(routineId);
  const { mutate: delRoutine } = useDeleteRoutine();
  const { mutate: duplicate } = useDuplicateRoutine();
  const { mutate: archive } = useArchiveRoutine();
  const { mutate: unarchive } = useUnarchiveRoutine();
  const { mutate: markPerformed } = useMarkPerformedRoutine();

  const [openDelete, setOpenDelete] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error</div>;
  if (!routine) return <div className="p-6">Not found</div>;

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6 lg:pt-20">
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {routine.name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Chip>
              <Clock className="h-4 w-4" />{" "}
              {fmtDuration(routine.estimatedDurationMin)}
            </Chip>
            <Chip>
              <RefreshCcw className="h-4 w-4" /> {routine.timesPerformed}×
            </Chip>
          </div>
        </div>

        <div className="flex gap-2 relative">
          <button
            className={`${btn.base} ${btn.secondary}`}
            onClick={() =>
              navigate({
                to: `/routines/update/${routine._id}`,
              })
            }
          >
            <Edit size={16} className="text-neutral-900" />{" "}
            <p className="text-neutral-900">Edit</p>
          </button>

          <button
            className={`${btn.base} ${btn.primary}`}
            onClick={() =>
              markPerformed({
                routineId: routine._id,
                date: new Date().toISOString(),
              })
            }
          >
            <Play size={16} className="text-neutral-900" />{" "}
            <p className="text-neutral-900">Start</p>
          </button>

          <button
            className={`${btn.base} ${btn.outline}`}
            onClick={() => setOpenMenu((v) => !v)}
          >
            <MoreVertical size={16} className="text-neutral-900" />
          </button>

          <Menu
            open={openMenu}
            onClose={() => setOpenMenu(false)}
            items={[
              {
                label: "Duplicate",
                icon: <Copy size={16} className="text-neutral-900" />,
                onClick: () =>
                  duplicate({
                    routineId: routine._id,
                    name: `${routine.name} (copy)`,
                  }),
              },
              {
                label: "Archive",
                icon: <Archive size={16} className="text-neutral-900" />,
                onClick: () => archive(routine._id),
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} className="text-neutral-900" />,
                onClick: () => setOpenDelete(true),
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      {/* BLOCKS */}
      <div className="space-y-5">
        {routine.blocks?.map((block, i) => {
          const Icon = getBlockIcon(block);

          return (
            <Card key={i}>
              <div
                className={`p-4 text-white bg-gradient-to-r ${BLOCK_THEMES[i % 4]} rounded-t-2xl flex gap-3 items-center`}
              >
                <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-xl">
                  <Icon />
                </div>
                <div>
                  <p className="font-semibold">{block.title}</p>
                </div>
              </div>

              <div className="divide-y">
                {block.exercises.map((ex) => (
                  <div
                    key={ex.name}
                    className="p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{ex.name}</p>
                      <p className="text-sm opacity-60">
                        {ex.sets} sets • {ex.reps}
                      </p>
                    </div>

                    {ex.videoUrl && (
                      <a href={ex.videoUrl}>
                        <Film size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* MODAL */}
      <Modal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete routine?"
        footer={
          <>
            <button onClick={() => setOpenDelete(false)}>Cancel</button>
            <button
              onClick={() => delRoutine(routine._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </>
        }
      >
        This cannot be undone.
      </Modal>
    </div>
  );
};

export default RoutineDetails;
