import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  deleteCoachConversation,
  getCoachConversation,
  listCoachConversations,
  sendCoachMessage,
} from "../controllers/coachController";

const router = Router();

router.use(requireAuth);

router.get("/coach/conversations", listCoachConversations);
router.get("/coach/conversations/:id", getCoachConversation);
router.delete("/coach/conversations/:id", deleteCoachConversation);
router.post("/coach/chat", sendCoachMessage);

export default router;
