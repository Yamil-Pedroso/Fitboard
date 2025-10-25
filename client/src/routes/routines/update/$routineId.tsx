import { createFileRoute } from "@tanstack/react-router";
import UpdateRoutine from "@/components/routines/routines-forms/UpdateRoutine";

export const Route = createFileRoute("/routines/update/$routineId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UpdateRoutine />;
}
