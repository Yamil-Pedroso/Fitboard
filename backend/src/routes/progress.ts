import { Router } from "express";
import * as ctrl from "../controllers/progressController";
import { requireAuth } from "../middlewares/auth";
import { upload } from "../middlewares/multer";

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

//router.post("/progress/:id/photos", upload.array("photos", 6), ctrl.addPhotos);
router.post(
  "/progress/:id/photos",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "side", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  ctrl.upsertPosedPhotos
);

router.post(
  "/progress/:id/reference-photos",
  upload.fields([
    { name: "start", maxCount: 1 },
    { name: "compare", maxCount: 1 },
  ]),
  ctrl.upsertReferencePhotosUpload
);

router.patch("/progress/:id/reference-photos", ctrl.setReferencePhotosByJson);

router.delete(
  "/progress/:id/reference-photos/:which",
  ctrl.removeReferencePhoto
);

router.delete("/progress/:id/photos/:photoId", ctrl.removePhoto);

export default router;
