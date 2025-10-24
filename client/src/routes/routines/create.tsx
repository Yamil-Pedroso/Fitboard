import { createFileRoute } from "@tanstack/react-router";
import CreateRoutine from "@/components/routines/routines-forms/CreateRoutine";

export const Route = createFileRoute("/routines/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateRoutine />;
}
