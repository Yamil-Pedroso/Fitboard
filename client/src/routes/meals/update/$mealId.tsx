import { createFileRoute } from "@tanstack/react-router";
import UpdateMeal from "@/components/meals/meal-forms/UpdateMeal";

export const Route = createFileRoute("/meals/update/$mealId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UpdateMeal />;
}
