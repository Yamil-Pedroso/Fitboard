import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";
import * as crtl from "../controllers/adminController";
const router = Router();
router.use(requireAuth, requireAdmin);

router.patch("/users/:id/is-admin", crtl.setIsAdmin);
router.patch("/users/:id/deactivate", crtl.deactivateUser);
router.delete("/users/:id", crtl.deleteUser);

export default router;
