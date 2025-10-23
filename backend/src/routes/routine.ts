import { Router } from "express";
import * as ctrl from "../controllers/routineController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);

router.get("/routines", ctrl.listRoutines);
router.get("/routines/:id", ctrl.getRoutine);
router.post("/routines", ctrl.createRoutine);
router.patch("/routines/:id", ctrl.updateRoutine);
router.put("/routines/:id", ctrl.replaceRoutine);
router.delete("/routines/:id", ctrl.deleteRoutine);

// acciones extra
router.post("/routines/:id/duplicate", ctrl.duplicateRoutine);
router.post("/routines/:id/archive", ctrl.archiveRoutine);
router.post("/routines/:id/unarchive", ctrl.unarchiveRoutine);
router.post("/routines/:id/mark-performed", ctrl.markPerformed);

// zod errors
router.use(ctrl.routinesErrorBoundary);

export default router;
