import { createFileRoute } from "@tanstack/react-router";
import MealsList from "@/components/meals/MealsList";
import Protected from "@/components/routing/Protected";

export const Route = createFileRoute("/meals/")({
  component: () => (
    <Protected>
      <MealsList />
    </Protected>
  ),
});
