import { Router } from "express";
import {
  listNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController";

const router = Router();

router.get("/", listNotifications);
router.post("/", createNotification);
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);

export default router;
