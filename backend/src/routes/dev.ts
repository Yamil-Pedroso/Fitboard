import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import * as crtl from "../controllers/devController";

const router = Router();
router.post("/dev/make-me-admin", requireAuth, crtl.makeMeAdmin);
export default router;
