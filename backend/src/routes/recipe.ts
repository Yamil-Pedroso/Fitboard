import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as ctrl from "../controllers/recipeController";

const route = Router();
route.use(requireAuth);

/**
 * @openapi
 * components:
 *   schemas:
 *     RecipeIngredient:
 *       type: object
 *       required: [name, amount, unit]
 *       properties:
 *         name:     { type: string, example: "Chicken breast" }
 *         amount:   { type: number, example: 200 }
 *         unit:     { type: string, example: "g" }
 *         calories: { type: number, example: 330 }
 *         protein:  { type: number, example: 62 }
 *         carbs:    { type: number, example: 0 }
 *         fat:      { type: number, example: 6 }
 *     RecipeStep:
 *       type: object
 *       properties:
 *         index: { type: integer, example: 1 }
 *         text:  { type: string, example: "Season the chicken with salt and pepper." }
 *     Recipe:
 *       type: object
 *       properties:
 *         id:          { type: string, example: "rcp_123" }
 *         userId:      { type: string, example: "usr_123" }
 *         title:       { type: string, example: "Grilled Chicken Bowl" }
 *         description: { type: string, example: "High-protein lunch with rice and veggies." }
 *         servings:    { type: integer, example: 2 }
 *         prepMinutes: { type: integer, example: 10 }
 *         cookMinutes: { type: integer, example: 15 }
 *         imageUrl:    { type: string, format: uri, nullable: true }
 *         tags:
 *           type: array
 *           items: { type: string }
 *         ingredients:
 *           type: array
 *           items: { $ref: '#/components/schemas/RecipeIngredient' }
 *         steps:
 *           type: array
 *           items: { $ref: '#/components/schemas/RecipeStep' }
 *         calories: { type: number, example: 520 }
 *         protein:  { type: number, example: 45 }
 *         carbs:    { type: number, example: 55 }
 *         fat:      { type: number, example: 14 }
 *         createdAt:  { type: string, format: date-time }
 *         updatedAt:  { type: string, format: date-time }
 *     CreateRecipeRequest:
 *       type: object
 *       required: [title, servings, ingredients]
 *       properties:
 *         title:       { type: string, example: "Grilled Chicken Bowl" }
 *         description: { type: string }
 *         servings:    { type: integer, example: 2 }
 *         prepMinutes: { type: integer, example: 10 }
 *         cookMinutes: { type: integer, example: 15 }
 *         imageUrl:    { type: string, format: uri }
 *         tags:
 *           type: array
 *           items: { type: string, example: "high-protein" }
 *         ingredients:
 *           type: array
 *           items: { $ref: '#/components/schemas/RecipeIngredient' }
 *         steps:
 *           type: array
 *           items: { $ref: '#/components/schemas/RecipeStep' }
 *     UpdateRecipeRequest:
 *       type: object
 *       description: Partial update
 *       properties:
 *         title:       { type: string }
 *         description: { type: string }
 *         servings:    { type: integer }
 *         prepMinutes: { type: integer }
 *         cookMinutes: { type: integer }
 *         imageUrl:    { type: string, format: uri }
 *         tags:
 *           type: array
 *           items: { type: string }
 *         ingredients:
 *           type: array
 *           items: { $ref: '#/components/schemas/RecipeIngredient' }
 *         steps:
 *           type: array
 *           items: { $ref: '#/components/schemas/RecipeStep' }
 *     ReplaceRecipeRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateRecipeRequest'
 *     PaginatedRecipesResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/Recipe' }
 *         page:  { type: integer, example: 1 }
 *         limit: { type: integer, example: 20 }
 *         total: { type: integer, example: 123 }
 */

/**
 * @openapi
 * /api/v1/recipes:
 *   get:
 *     tags: [Recipes]
 *     summary: List recipes (paginated)
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Optional search query
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedRecipesResponse' }
 */
route.get("/recipes", ctrl.listRecipes);

/**
 * @openapi
 * /api/v1/recipes:
 *   post:
 *     tags: [Recipes]
 *     summary: Create a recipe
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateRecipeRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Recipe' }
 */
route.post("/recipes", ctrl.createRecipe);

/**
 * @openapi
 * /api/v1/recipes/{id}:
 *   get:
 *     tags: [Recipes]
 *     summary: Get a recipe by ID
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
 *             schema: { $ref: '#/components/schemas/Recipe' }
 *       404: { description: Not found }
 */
route.get("/recipes/:id", ctrl.getRecipe);

/**
 * @openapi
 * /api/v1/recipes/{id}:
 *   patch:
 *     tags: [Recipes]
 *     summary: Partially update a recipe
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
 *           schema: { $ref: '#/components/schemas/UpdateRecipeRequest' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Recipe' }
 *       404: { description: Not found }
 */
route.patch("/recipes/:id", ctrl.updateRecipe);

/**
 * @openapi
 * /api/v1/recipes/{id}:
 *   put:
 *     tags: [Recipes]
 *     summary: Replace a recipe (full update)
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
 *           schema: { $ref: '#/components/schemas/ReplaceRecipeRequest' }
 *     responses:
 *       200:
 *         description: Replaced
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Recipe' }
 *       404: { description: Not found }
 */
route.put("/recipes/:id", ctrl.replaceRecipe);

/**
 * @openapi
 * /api/v1/recipes/{id}:
 *   delete:
 *     tags: [Recipes]
 *     summary: Delete a recipe
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
route.delete("/recipes/:id", ctrl.deleteRecipe);

export default route;
