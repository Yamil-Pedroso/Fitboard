import { createFileRoute } from "@tanstack/react-router";
import CreateRecipe from "@/components/recipes/recipes-forms/CreateRecipe";
import Protected from "@/components/routing/Protected";

export const Route = createFileRoute("/recipes/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Protected>
      <CreateRecipe />
    </Protected>
  );
}
