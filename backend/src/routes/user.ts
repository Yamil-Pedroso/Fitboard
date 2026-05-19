import { Router } from "express";
import * as ctrl from "../controllers/userController";
import { requireAuth } from "../middlewares/auth";
import multer from "multer";
import { requireAdmin } from "../middlewares/requireAdmin";
const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string, example: "usr_123" }
 *         name: { type: string, example: "Jane Doe" }
 *         email: { type: string, format: email, example: "jane@mail.com" }
 *         avatarUrl: { type: string, format: uri, nullable: true }
 *         role: { type: string, example: "user" }
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name: { type: string, example: "Jane Doe" }
 *         email: { type: string, format: email, example: "jane@mail.com" }
 *         password: { type: string, format: password, example: "StrongPass!123" }
 *         avatar:
 *           type: string
 *           format: binary
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email, example: "jane@mail.com" }
 *         password: { type: string, format: password, example: "StrongPass!123" }
 *     UpdateMeRequest:
 *       type: object
 *       additionalProperties: true
 *       properties:
 *         name: { type: string, example: "Jane Updated" }
 *         unitSystem: { type: string, enum: ["metric","imperial"] }
 *     ChangePasswordRequest:
 *       type: object
 *       required: [oldPassword, newPassword]
 *       properties:
 *         oldPassword: { type: string, format: password }
 *         newPassword: { type: string, format: password }
 *     ForgotPasswordRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email: { type: string, format: email }
 *     ResetPasswordRequest:
 *       type: object
 *       required: [token, password]
 *       properties:
 *         token: { type: string }
 *         password: { type: string, format: password }
 *     AiCoachRequest:
 *       type: object
 *       properties:
 *         prompt: { type: string, example: "Improve fat loss pace" }
 *         goal: { type: string, example: "cut" }
 *         unitSystem: { type: string, enum: ["metric","imperial"] }
 *         stats:
 *           type: object
 *           additionalProperties: true
 */

/**
 * @openapi
 * /api/v1/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/register", upload.single("avatar"), ctrl.register);

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin only)
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/users", requireAuth, requireAdmin, ctrl.getUsers);

/**
 * @openapi
 * /api/v1/login:
 *   post:
 *     tags: [Users]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/login", ctrl.login);

/**
 * @openapi
 * /api/v1/me:
 *   get:
 *     tags: [Users]
 *     summary: Get my profile
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: OK
 */
router.get("/me", requireAuth, ctrl.me);

/**
 * @openapi
 * /api/v1/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update my profile
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMeRequest'
 *     responses:
 *       200:
 *         description: OK
 */
router.patch("/me", requireAuth, ctrl.updateMe);

/**
 * @openapi
 * /api/v1/me/avatar:
 *   patch:
 *     tags: [Users]
 *     summary: Update my avatar
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: OK
 */
console.log("✅ userRoutes loaded with /me/avatar");
router.patch(
  "/me/avatar",
  requireAuth,
  upload.single("avatar"),
  ctrl.updateAvatar,
);

/**
 * @openapi
 * /api/v1/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change password
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/change-password", requireAuth, ctrl.changePassword);

/**
 * @openapi
 * /api/v1/logout:
 *   post:
 *     tags: [Users]
 *     summary: Logout
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/logout", requireAuth, ctrl.logout);

/**
 * @openapi
 * /api/v1/forgot-password:
 *   post:
 *     tags: [Users]
 *     summary: Start password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Email sent (if the account exists)
 */
router.post("/forgot-password", ctrl.forgotPassword);

/**
 * @openapi
 * /api/v1/reset-password:
 *   post:
 *     tags: [Users]
 *     summary: Complete password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/reset-password", ctrl.resetPassword);

export default router;
