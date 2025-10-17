import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as ctrl from "../controllers/recipeController";

const route = Router();
route.use(requireAuth);

route.get("/recipes", ctrl.listRecipes);
route.post("/recipes", ctrl.createRecipe);
route.get("/recipes/:id", ctrl.getRecipe);
route.patch("/recipes/:id", ctrl.updateRecipe);
route.put("/recipes/:id", ctrl.replaceRecipe);
route.delete("/recipes/:id", ctrl.deleteRecipe);

export default route;
