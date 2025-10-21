import { createFileRoute } from "@tanstack/react-router";
import CreateRecipe from "@/components/recipes/recipes-forms/CreateRecipe";

export const Route = createFileRoute("/recipes/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateRecipe />;
}
