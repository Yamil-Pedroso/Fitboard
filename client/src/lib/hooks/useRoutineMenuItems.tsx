import { Copy, Archive, Trash2 } from "lucide-react";
import {
  useDuplicateRoutine,
  useArchiveRoutine,
  //useUnarchiveRoutine,
} from "@/lib/hooks/useRoutines";

export const useRoutineMenuItems = (
  routine: { _id: string; name: string },
  onDeleteRequest: () => void,
) => {
  const { mutate: duplicate } = useDuplicateRoutine();
  const { mutate: archive } = useArchiveRoutine();
  //const { mutate: unarchive } = useUnarchiveRoutine();

  return [
    {
      label: "Duplicate",
      icon: <Copy size={16} />,
      onClick: () =>
        duplicate({ routineId: routine._id, name: routine.name + " Copy" }),
    },
    {
      label: "Archive",
      icon: <Archive size={16} />,
      onClick: () => archive(routine._id),
    },
    {
      label: "Delete",
      icon: <Trash2 size={16} />,
      onClick: onDeleteRequest,
      danger: true,
    },
  ];
};
