import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";
import * as crtl from "../controllers/adminController";
const router = Router();

router.use(requireAuth, requireAdmin);

/**
 * @openapi
 * components:
 *   schemas:
 *     AdminSetAdminRequest:
 *       type: object
 *       required: [isAdmin]
 *       properties:
 *         isAdmin:
 *           type: boolean
 *           description: true to grant admin, false to revoke
 *           example: true
 *     AdminDeactivateUserRequest:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           example: "User requested deactivation"
 *     AdminActionResponse:
 *       type: object
 *       properties:
 *         ok: { type: boolean, example: true }
 *         userId: { type: string, example: "usr_123" }
 *         message: { type: string, example: "User updated successfully" }
 */

/**
 * @openapi
 * /api/v1/admin/users/{id}/is-admin:
 *   patch:
 *     tags: [Admin]
 *     summary: Grant or revoke admin role for a user
 *     description: Requires admin privileges.
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSetAdminRequest'
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminActionResponse'
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: User not found }
 */
router.patch("/users/:id/is-admin", crtl.setIsAdmin);

/**
 * @openapi
 * /api/v1/admin/users/{id}/deactivate:
 *   patch:
 *     tags: [Admin]
 *     summary: Deactivate a user account
 *     description: Requires admin privileges.
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminDeactivateUserRequest'
 *     responses:
 *       200:
 *         description: User deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminActionResponse'
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: User not found }
 */
router.patch("/users/:id/deactivate", crtl.deactivateUser);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Permanently delete a user
 *     description: Requires admin privileges.
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: User ID
 *     responses:
 *       204:
 *         description: Deleted (no content)
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: User not found }
 */
router.delete("/users/:id", crtl.deleteUser);

export default router;
