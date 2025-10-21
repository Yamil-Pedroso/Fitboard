import { createFileRoute } from "@tanstack/react-router";
import UpdateRecipe from "@/components/recipes/recipes-forms/UpdateRecipe";

export const Route = createFileRoute("/recipes/update/$recipeId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UpdateRecipe />;
}
