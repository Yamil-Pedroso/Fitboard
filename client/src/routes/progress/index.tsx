import { createFileRoute } from "@tanstack/react-router";
import ProgressFeatures from "@/components/progress/ProgressFeatures";
import Protected from "@/components/routing/Protected";

export const Route = createFileRoute("/progress/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Protected>
      <ProgressFeatures />
    </Protected>
  );
}
