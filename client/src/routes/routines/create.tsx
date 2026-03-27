import { createFileRoute } from "@tanstack/react-router";
import CreateRoutine from "@/components/routines/routines-forms/CreateRoutine";
import Protected from "@/components/routing/Protected";

export const Route = createFileRoute("/routines/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Protected>
      <CreateRoutine />
    </Protected>
  );
}
