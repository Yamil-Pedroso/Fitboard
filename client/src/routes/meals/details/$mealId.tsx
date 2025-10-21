import { createFileRoute } from "@tanstack/react-router";
import MealDetails from "@/components/meals/MealDetails";

export const Route = createFileRoute("/meals/details/$mealId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MealDetails />;
}
