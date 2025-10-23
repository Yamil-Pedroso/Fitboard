import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as crtl from "../controllers/mealController";

const router = Router();
router.use(requireAuth);

router.get("/meals", crtl.listAllMeals); // ?page=1&limit=20
router.get("/meals/day", crtl.listMealsByDay); // ?date=YYYY-MM-DD
router.get("/meals/range", crtl.listMealsByRange); // ?from=YYYY-MM-DD&to=YYYY-MM-DD
router.post("/meals", crtl.createMeal);
router.get("/meals/:id", crtl.getMeal);
router.patch("/meals/:id", crtl.updateMeal);
router.put("/meals/:id", crtl.replaceMeal);

router.post("/meals/:id/move", crtl.moveMeal);
router.delete("/meals/:id", crtl.deleteMeal);

router.use(crtl.mealsErrorBoundary);
export default router;
