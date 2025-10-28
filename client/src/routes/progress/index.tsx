import { createFileRoute } from "@tanstack/react-router";
import ProgressFeatures from "@/components/progress/ProgressFeatures";

export const Route = createFileRoute("/progress/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProgressFeatures />;
}
