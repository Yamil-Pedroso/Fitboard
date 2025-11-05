import { Router } from "express";
import * as ctrl from "../controllers/routineController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

/**
 * @openapi
 * components:
 *   schemas:
 *     RoutineExercise:
 *       type: object
 *       required: [name]
 *       properties:
 *         id:        { type: string, example: "rex_001" }
 *         name:      { type: string, example: "Barbell Squat" }
 *         notes:     { type: string, example: "Keep neutral spine" }
 *         sets:      { type: integer, example: 4 }
 *         reps:      { type: integer, example: 8 }
 *         rir:       { type: integer, example: 2, description: "Reps in Reserve" }
 *         tempo:     { type: string, example: "3-1-1" }
 *         restSec:   { type: integer, example: 120 }
 *         weightKg:  { type: number, example: 80 }
 *     Routine:
 *       type: object
 *       properties:
 *         id:          { type: string, example: "rtn_123" }
 *         userId:      { type: string, example: "usr_123" }
 *         title:       { type: string, example: "Lower Body Strength" }
 *         description: { type: string, example: "Heavy compounds, 2x/week" }
 *         tags:
 *           type: array
 *           items: { type: string, example: "strength" }
 *         archived:    { type: boolean, example: false }
 *         exercises:
 *           type: array
 *           items: { $ref: '#/components/schemas/RoutineExercise' }
 *         createdAt:   { type: string, format: date-time }
 *         updatedAt:   { type: string, format: date-time }
 *     CreateRoutineRequest:
 *       type: object
 *       required: [title, exercises]
 *       properties:
 *         title:       { type: string }
 *         description: { type: string }
 *         tags:
 *           type: array
 *           items: { type: string }
 *         exercises:
 *           type: array
 *           items: { $ref: '#/components/schemas/RoutineExercise' }
 *     UpdateRoutineRequest:
 *       type: object
 *       description: Partial update
 *       properties:
 *         title:       { type: string }
 *         description: { type: string }
 *         tags:
 *           type: array
 *           items: { type: string }
 *         archived:    { type: boolean }
 *         exercises:
 *           type: array
 *           items: { $ref: '#/components/schemas/RoutineExercise' }
 *     ReplaceRoutineRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateRoutineRequest'
 *     PaginatedRoutinesResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/Routine' }
 *         page:  { type: integer, example: 1 }
 *         limit: { type: integer, example: 20 }
 *         total: { type: integer, example: 42 }
 *     ArchiveRoutineRequest:
 *       type: object
 *       properties:
 *         reason: { type: string, example: "Completed this block" }
 *     MarkPerformedRequest:
 *       type: object
 *       properties:
 *         performedAt: { type: string, format: date-time, example: "2025-11-05T18:30:00Z" }
 */

/**
 * @openapi
 * /api/v1/routines:
 *   get:
 *     tags: [Routines]
 *     summary: List routines (paginated)
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Optional search/filter
 *       - in: query
 *         name: archived
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedRoutinesResponse' }
 */
router.get("/routines", ctrl.listRoutines);

/**
 * @openapi
 * /api/v1/routines/{id}:
 *   get:
 *     tags: [Routines]
 *     summary: Get routine by ID
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
 *             schema: { $ref: '#/components/schemas/Routine' }
 *       404: { description: Not found }
 */
router.get("/routines/:id", ctrl.getRoutine);

/**
 * @openapi
 * /api/v1/routines:
 *   post:
 *     tags: [Routines]
 *     summary: Create a routine
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateRoutineRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Routine' }
 */
router.post("/routines", ctrl.createRoutine);

/**
 * @openapi
 * /api/v1/routines/{id}:
 *   patch:
 *     tags: [Routines]
 *     summary: Partially update a routine
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
 *           schema: { $ref: '#/components/schemas/UpdateRoutineRequest' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Routine' }
 *       404: { description: Not found }
 */
router.patch("/routines/:id", ctrl.updateRoutine);

/**
 * @openapi
 * /api/v1/routines/{id}:
 *   put:
 *     tags: [Routines]
 *     summary: Replace a routine (full update)
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
 *           schema: { $ref: '#/components/schemas/ReplaceRoutineRequest' }
 *     responses:
 *       200:
 *         description: Replaced
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Routine' }
 *       404: { description: Not found }
 */
router.put("/routines/:id", ctrl.replaceRoutine);

/**
 * @openapi
 * /api/v1/routines/{id}:
 *   delete:
 *     tags: [Routines]
 *     summary: Delete a routine
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
router.delete("/routines/:id", ctrl.deleteRoutine);

/**
 * @openapi
 * /api/v1/routines/{id}/duplicate:
 *   post:
 *     tags: [Routines]
 *     summary: Duplicate a routine
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Duplicated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Routine' }
 *       404: { description: Not found }
 */
router.post("/routines/:id/duplicate", ctrl.duplicateRoutine);

/**
 * @openapi
 * /api/v1/routines/{id}/archive:
 *   post:
 *     tags: [Routines]
 *     summary: Archive a routine
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
 *           schema: { $ref: '#/components/schemas/ArchiveRoutineRequest' }
 *     responses:
 *       200:
 *         description: Archived
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Routine' }
 *       404: { description: Not found }
 */
router.post("/routines/:id/archive", ctrl.archiveRoutine);

/**
 * @openapi
 * /api/v1/routines/{id}/unarchive:
 *   post:
 *     tags: [Routines]
 *     summary: Unarchive a routine
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Unarchived
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Routine' }
 *       404: { description: Not found }
 */
router.post("/routines/:id/unarchive", ctrl.unarchiveRoutine);

/**
 * @openapi
 * /api/v1/routines/{id}/mark-performed:
 *   post:
 *     tags: [Routines]
 *     summary: Mark routine as performed (creates a log/mark)
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
 *           schema: { $ref: '#/components/schemas/MarkPerformedRequest' }
 *     responses:
 *       201:
 *         description: Mark created
 *       404: { description: Not found }
 */
router.post("/routines/:id/mark-performed", ctrl.markPerformed);

// zod errors
router.use(ctrl.routinesErrorBoundary);

export default router;
