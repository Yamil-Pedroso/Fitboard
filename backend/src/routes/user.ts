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

router.post("/register", upload.single("avatar"), ctrl.register);
router.get("/users", requireAuth, requireAdmin, ctrl.getUsers);
router.post("/login", ctrl.login);
router.get("/me", requireAuth, ctrl.me);
router.patch("/me", requireAuth, ctrl.updateMe);
router.post("/change-password", requireAuth, ctrl.changePassword);
router.post("/logout", requireAuth, ctrl.logout);

// Password reset flow
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);

export default router;
