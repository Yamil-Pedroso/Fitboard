import { createFileRoute } from "@tanstack/react-router";
import CreateMeal from "@/components/meals/meal-forms/CreateMeal";
import Protected from "@/components/routing/Protected";

export const Route = createFileRoute("/meals/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Protected>
      <CreateMeal />
    </Protected>
  );
}
