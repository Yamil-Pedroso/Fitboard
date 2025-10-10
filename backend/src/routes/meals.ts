import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  listAllMeals,
  createMeal,
  listMealsByDay,
  listMealsByRange,
  getMeal,
  updateMeal,
  replaceMeal,
  deleteMeal,
  moveMeal,
  mealsErrorBoundary,
} from "../controllers/mealController";

const router = Router();
router.use(requireAuth);

router.get("/meals", listAllMeals); // ?page=1&limit=20
router.get("/meals/day", listMealsByDay); // ?date=YYYY-MM-DD
router.get("/meals/range", listMealsByRange); // ?from=YYYY-MM-DD&to=YYYY-MM-DD
router.post("/meals", createMeal);
router.get("/meals/:id", getMeal);
router.patch("/meals/:id", updateMeal);
router.put("/meals/:id", replaceMeal);

router.post("/meals/:id/move", moveMeal);
router.delete("/meals/:id", deleteMeal);

router.use(mealsErrorBoundary);
export default router;
