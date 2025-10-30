import { Router } from "express";
import * as ctrl from "../controllers/progressController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.post("/progress", ctrl.createProgress);
router.put("/progress/:date", ctrl.upsertByDate);

router.get("/progress", ctrl.listProgress);
router.get("/progress/stats", ctrl.stats);
router.get("/progress/date/:date", ctrl.getByDate);
router.get("/progress/:id", ctrl.getById);

router.patch("/progress/:id", ctrl.updateById);
router.delete("/progress/:id", ctrl.removeById);

export default router;
