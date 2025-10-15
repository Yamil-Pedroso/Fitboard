import { createFileRoute } from "@tanstack/react-router";
import CreateMeal from "@/components/meals/meal-forms/CreateMeal";

export const Route = createFileRoute("/meals/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateMeal />;
}
