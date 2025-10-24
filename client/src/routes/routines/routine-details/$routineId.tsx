import { createFileRoute } from "@tanstack/react-router";
import RoutineDetails from "@/components/routines/RoutineDetails";

export const Route = createFileRoute("/routines/routine-details/$routineId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RoutineDetails />;
}
