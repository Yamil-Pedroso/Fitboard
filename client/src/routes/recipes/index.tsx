import { createFileRoute } from "@tanstack/react-router";
import RecipesList from "@/components/recipes/RecipesList";
import Protected from "@/components/routing/Protected";

export const Route = createFileRoute("/recipes/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Protected>
      <RecipesList />
    </Protected>
  );
}
