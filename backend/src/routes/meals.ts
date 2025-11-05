import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as crtl from "../controllers/mealController";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * components:
 *   schemas:
 *     MealItem:
 *       type: object
 *       required: [name, amount, unit]
 *       properties:
 *         name: { type: string, example: "Oatmeal" }
 *         amount: { type: number, example: 80 }
 *         unit: { type: string, example: "g" }
 *         calories: { type: number, example: 300 }
 *         protein: { type: number, example: 12 }
 *         carbs: { type: number, example: 50 }
 *         fat: { type: number, example: 6 }
 *     Meal:
 *       type: object
 *       properties:
 *         id: { type: string, example: "meal_123" }
 *         userId: { type: string, example: "usr_123" }
 *         date: { type: string, format: date, example: "2025-11-05" }
 *         time: { type: string, example: "08:30" }
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *           example: "breakfast"
 *         notes: { type: string, example: "Pre-workout meal" }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/MealItem' }
 *         totalCalories: { type: number, example: 520 }
 *         totalProtein: { type: number, example: 35 }
 *         totalCarbs: { type: number, example: 65 }
 *         totalFat: { type: number, example: 15 }
 *     CreateMealRequest:
 *       type: object
 *       required: [date, items]
 *       properties:
 *         date: { type: string, format: date, example: "2025-11-05" }
 *         time: { type: string, example: "12:45" }
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         notes: { type: string }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/MealItem' }
 *     UpdateMealRequest:
 *       type: object
 *       description: Partial update
 *       properties:
 *         date: { type: string, format: date }
 *         time: { type: string }
 *         mealType: { type: string, enum: [breakfast, lunch, dinner, snack] }
 *         notes: { type: string }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/MealItem' }
 *     ReplaceMealRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateMealRequest'
 *     MoveMealRequest:
 *       type: object
 *       required: [date]
 *       properties:
 *         date: { type: string, format: date, example: "2025-11-08" }
 *         time: { type: string, example: "19:30" }
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *     PaginatedMealsResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/Meal' }
 *         page: { type: integer, example: 1 }
 *         limit: { type: integer, example: 20 }
 *         total: { type: integer, example: 124 }
 */

/**
 * @openapi
 * /api/v1/meals:
 *   get:
 *     tags: [Meals]
 *     summary: List meals (paginated)
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedMealsResponse' }
 */
router.get("/meals", crtl.listAllMeals); // ?page=1&limit=20

/**
 * @openapi
 * /api/v1/meals/day:
 *   get:
 *     tags: [Meals]
 *     summary: List meals for a specific day
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *         description: YYYY-MM-DD
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Meal' }
 */
router.get("/meals/day", crtl.listMealsByDay); // ?date=YYYY-MM-DD

/**
 * @openapi
 * /api/v1/meals/range:
 *   get:
 *     tags: [Meals]
 *     summary: List meals between two dates (inclusive)
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Meal' }
 */
router.get("/meals/range", crtl.listMealsByRange); // ?from=YYYY-MM-DD&to=YYYY-MM-DD

/**
 * @openapi
 * /api/v1/meals:
 *   post:
 *     tags: [Meals]
 *     summary: Create a meal
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateMealRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Meal' }
 */
router.post("/meals", crtl.createMeal);

/**
 * @openapi
 * /api/v1/meals/{id}:
 *   get:
 *     tags: [Meals]
 *     summary: Get a meal by ID
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Meal' }
 *       404: { description: Not found }
 */
router.get("/meals/:id", crtl.getMeal);

/**
 * @openapi
 * /api/v1/meals/{id}:
 *   patch:
 *     tags: [Meals]
 *     summary: Partially update a meal
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateMealRequest' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Meal' }
 *       404: { description: Not found }
 */
router.patch("/meals/:id", crtl.updateMeal);

/**
 * @openapi
 * /api/v1/meals/{id}:
 *   put:
 *     tags: [Meals]
 *     summary: Replace a meal (full update)
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ReplaceMealRequest' }
 *     responses:
 *       200:
 *         description: Replaced
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Meal' }
 *       404: { description: Not found }
 */
router.put("/meals/:id", crtl.replaceMeal);

/**
 * @openapi
 * /api/v1/meals/{id}/move:
 *   post:
 *     tags: [Meals]
 *     summary: Move a meal to a different date/time/slot
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MoveMealRequest' }
 *     responses:
 *       200:
 *         description: Moved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Meal' }
 *       404: { description: Not found }
 */
router.post("/meals/:id/move", crtl.moveMeal);

/**
 * @openapi
 * /api/v1/meals/{id}:
 *   delete:
 *     tags: [Meals]
 *     summary: Delete a meal
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not found }
 */
router.delete("/meals/:id", crtl.deleteMeal);

router.use(crtl.mealsErrorBoundary);

export default router;
