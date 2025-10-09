import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  deactivateUser,
  deleteUser,
  setIsAdmin,
} from "../controllers/adminController";

const router = Router();
router.use(requireAuth, requireAdmin);

router.patch("/users/:id/is-admin", setIsAdmin);
router.patch("/users/:id/deactivate", deactivateUser);
router.delete("/users/:id", deleteUser);

export default router;
