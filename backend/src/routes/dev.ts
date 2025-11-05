import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as crtl from "../controllers/devController";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     DevMakeMeAdminResponse:
 *       type: object
 *       properties:
 *         ok: { type: boolean, example: true }
 *         userId: { type: string, example: "usr_123" }
 *         role: { type: string, example: "admin" }
 *         message: { type: string, example: "User promoted to admin." }
 */

/**
 * @openapi
 * /api/v1/dev/make-me-admin:
 *   post:
 *     tags: [Dev]
 *     summary: Grant admin role to the authenticated user (development-only)
 *     description: Requires authentication. Intended for local/dev environments.
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: User promoted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DevMakeMeAdminResponse'
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post("/dev/make-me-admin", requireAuth, crtl.makeMeAdmin);

export default router;
