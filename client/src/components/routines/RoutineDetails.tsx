/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useState } from "react";
import { Route } from "@/routes/routines/routine-details/$routineId";
import { useNavigate } from "@tanstack/react-router";
import {
  useRoutineById,
  useDeleteRoutine,
  useMarkPerformedRoutine,
} from "@/lib/hooks/useRoutines";
import type { IRoutineBlock } from "@/services/routineService";
import { btn } from "../ui/btn";
import { fmtDuration } from "@/lib/utils/format";
import Chip from "../ui/chip";
import Card from "../ui/card";
import Modal from "./Modal";
import RoutineMenu from "./RoutineMenu";
import { useRoutineMenuItems } from "@/lib/hooks/useRoutineMenuItems";
import {
  Dumbbell,
  Clock,
  Play,
  Edit,
  MoreVertical,
  RefreshCcw,
  Film,
  Flame,
  Activity,
  Move,
} from "lucide-react";

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
  const menuItems = useRoutineMenuItems({ _id: routineId, name: "" }, () =>
    setOpenDelete(true),
  );

  const { data: routine, isLoading, error } = useRoutineById(routineId);
  const { mutate: delRoutine } = useDeleteRoutine();
  const { mutate: markPerformed } = useMarkPerformedRoutine();

  const [openDelete, setOpenDelete] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error</div>;
  if (!routine) return <div className="p-6">Not found</div>;

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6 lg:pt-20">
      <div className="mb-6 flex flex-col items-center sm:flex-row justify-between gap-4">
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
          <div>
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
          </div>

          <div>
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
          </div>

          <div>
            <button
              className={`${btn.base} ${btn.outline}`}
              onClick={() => setOpenMenu((v) => !v)}
            >
              <MoreVertical size={16} className="text-neutral-900" />
            </button>
          </div>

          <RoutineMenu
            open={openMenu}
            onClose={() => setOpenMenu(false)}
            items={menuItems}
          />
        </div>
      </div>

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
