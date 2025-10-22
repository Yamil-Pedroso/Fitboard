import { createFileRoute } from "@tanstack/react-router";
import Protected from "@/components/routing/Protected";
import RoutinesList from "@/components/routines/RoutinesList";

export const Route = createFileRoute("/routines/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Protected>
      <RoutinesList />
    </Protected>
  );
}
