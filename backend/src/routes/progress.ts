import { Router } from "express";
import * as ctrl from "../controllers/progressController";
import { requireAuth } from "../middlewares/auth";
import { upload } from "../middlewares/multer";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * components:
 *   schemas:
 *     ProgressPhoto:
 *       type: object
 *       properties:
 *         id: { type: string, example: "pho_abc123" }
 *         pose:
 *           type: string
 *           enum: [front, side, back]
 *           example: front
 *         url: { type: string, format: uri }
 *         createdAt: { type: string, format: date-time }
 *     ReferencePhoto:
 *       type: object
 *       properties:
 *         url: { type: string, format: uri }
 *         uploadedAt: { type: string, format: date-time }
 *     ProgressEntry:
 *       type: object
 *       properties:
 *         id: { type: string, example: "prg_123" }
 *         date: { type: string, format: date, example: "2025-11-05" }
 *         unitSystem: { type: string, enum: [metric, imperial], example: metric }
 *         weight_kg: { type: number, example: 72.4, nullable: true }
 *         waist_cm: { type: number, example: 81, nullable: true }
 *         body:
 *           type: object
 *           properties:
 *             bodyFatPct: { type: number, example: 18.6, nullable: true }
 *         activity:
 *           type: object
 *           properties:
 *             steps: { type: integer, example: 8500, nullable: true }
 *         photos:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProgressPhoto' }
 *         startPhoto: { $ref: '#/components/schemas/ReferencePhoto' }
 *         comparePhoto: { $ref: '#/components/schemas/ReferencePhoto' }
 *         notes: { type: string, example: "Felt great this week." }
 *         tags:
 *           type: array
 *           items: { type: string }
 *     CreateProgressRequest:
 *       type: object
 *       required: [date]
 *       properties:
 *         date: { type: string, format: date, example: "2025-11-05" }
 *         unitSystem: { type: string, enum: [metric, imperial] }
 *         weight_kg: { type: number }
 *         waist_cm: { type: number }
 *         body:
 *           type: object
 *           properties:
 *             bodyFatPct: { type: number }
 *         activity:
 *           type: object
 *           properties:
 *             steps: { type: integer }
 *         notes: { type: string }
 *         tags:
 *           type: array
 *           items: { type: string }
 *     UpdateProgressRequest:
 *       type: object
 *       description: Partial update of a progress entry
 *       additionalProperties: true
 *       properties:
 *         unitSystem: { type: string, enum: [metric, imperial] }
 *         weight_kg: { type: number }
 *         waist_cm: { type: number }
 *         body:
 *           type: object
 *           properties:
 *             bodyFatPct: { type: number }
 *         activity:
 *           type: object
 *           properties:
 *             steps: { type: integer }
 *         notes: { type: string }
 *         tags:
 *           type: array
 *           items: { type: string }
 *     PaginatedProgressResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProgressEntry' }
 *         page: { type: integer, example: 1 }
 *         limit: { type: integer, example: 10 }
 *         total: { type: integer, example: 57 }
 *     ProgressStatsResponse:
 *       type: object
 *       properties:
 *         count: { type: integer, example: 42 }
 *         latestDate: { type: string, format: date, example: "2025-11-05" }
 *         weightDelta_kg: { type: number, example: -2.3, nullable: true }
 *         waistDelta_cm: { type: number, example: -4, nullable: true }
 *         bodyFatDelta_pct: { type: number, example: -1.5, nullable: true }
 */

/**
 * @openapi
 * /api/v1/progress:
 *   post:
 *     tags: [Progress]
 *     summary: Create a progress entry
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProgressRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProgressEntry' }
 */
router.post("/progress", ctrl.createProgress);

/**
 * @openapi
 * /api/v1/progress/{date}:
 *   put:
 *     tags: [Progress]
 *     summary: Upsert a progress entry by date
 *     description: Creates or updates the entry for the given date (YYYY-MM-DD).
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateProgressRequest' }
 *     responses:
 *       200:
 *         description: Upserted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProgressEntry' }
 */
router.put("/progress/:date", ctrl.upsertByDate);

/**
 * @openapi
 * /api/v1/progress:
 *   get:
 *     tags: [Progress]
 *     summary: List progress entries (paginated)
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "-date" }
 *         description: e.g. "-date" for newest first
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaginatedProgressResponse' }
 */
router.get("/progress", ctrl.listProgress);

/**
 * @openapi
 * /api/v1/progress/stats:
 *   get:
 *     tags: [Progress]
 *     summary: Get aggregated progress stats
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProgressStatsResponse' }
 */
router.get("/progress/stats", ctrl.stats);

/**
 * @openapi
 * /api/v1/progress/date/{date}:
 *   get:
 *     tags: [Progress]
 *     summary: Get a progress entry by date
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProgressEntry' }
 *       404: { description: Not found }
 */
router.get("/progress/date/:date", ctrl.getByDate);

/**
 * @openapi
 * /api/v1/progress/{id}:
 *   get:
 *     tags: [Progress]
 *     summary: Get a progress entry by ID
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
 *             schema: { $ref: '#/components/schemas/ProgressEntry' }
 *       404: { description: Not found }
 */
router.get("/progress/:id", ctrl.getById);

/**
 * @openapi
 * /api/v1/progress/{id}:
 *   patch:
 *     tags: [Progress]
 *     summary: Update a progress entry by ID (partial)
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
 *           schema: { $ref: '#/components/schemas/UpdateProgressRequest' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProgressEntry' }
 *       404: { description: Not found }
 */
router.patch("/progress/:id", ctrl.updateById);

/**
 * @openapi
 * /api/v1/progress/{id}:
 *   delete:
 *     tags: [Progress]
 *     summary: Delete a progress entry by ID
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
router.delete("/progress/:id", ctrl.removeById);

/**
 * @openapi
 * /api/v1/progress/{id}/photos:
 *   post:
 *     tags: [Progress]
 *     summary: Upsert posed photos (front/side/back)
 *     description: Upload up to one file per pose field. Fields are optional.
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               front:
 *                 type: string
 *                 format: binary
 *               side:
 *                 type: string
 *                 format: binary
 *               back:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photos upserted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProgressEntry' }
 */
router.post(
  "/progress/:id/photos",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "side", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  ctrl.upsertPosedPhotos
);

/**
 * @openapi
 * /api/v1/progress/{id}/reference-photos:
 *   post:
 *     tags: [Progress]
 *     summary: Upload reference photos (start/compare)
 *     description: Upload 0–2 files: `start` and/or `compare`.
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               start:
 *                 type: string
 *                 format: binary
 *               compare:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Reference photos updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProgressEntry' }
 */
router.post(
  "/progress/:id/reference-photos",
  upload.fields([
    { name: "start", maxCount: 1 },
    { name: "compare", maxCount: 1 },
  ]),
  ctrl.upsertReferencePhotosUpload
);

/**
 * @openapi
 * /api/v1/progress/{id}/reference-photos:
 *   patch:
 *     tags: [Progress]
 *     summary: Set reference photos by JSON (existing URLs or IDs)
 *     description: Provide `start` and/or `compare` as strings (URLs or storage ids).
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
 *           schema:
 *             type: object
 *             properties:
 *               start: { type: string, example: "https://..." }
 *               compare: { type: string, example: "https://..." }
 *     responses:
 *       200:
 *         description: Reference photos set
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProgressEntry' }
 */
router.patch("/progress/:id/reference-photos", ctrl.setReferencePhotosByJson);

/**
 * @openapi
 * /api/v1/progress/{id}/reference-photos/{which}:
 *   delete:
 *     tags: [Progress]
 *     summary: Remove a reference photo
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: which
 *         required: true
 *         schema:
 *           type: string
 *           enum: [start, compare]
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not found }
 */
router.delete(
  "/progress/:id/reference-photos/:which",
  ctrl.removeReferencePhoto
);

/**
 * @openapi
 * /api/v1/progress/{id}/photos/{photoId}:
 *   delete:
 *     tags: [Progress]
 *     summary: Remove a posed photo by photo ID
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 *       404: { description: Not found }
 */
router.delete("/progress/:id/photos/:photoId", ctrl.removePhoto);

export default router;
