import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { makeMeAdmin } from "../controllers/devController";

const router = Router();
router.post("/dev/make-me-admin", requireAuth, makeMeAdmin);
export default router;
