import express from "express";
import {
  createCheckoutSession,
  selectFreePlan,
} from "../controllers/billingController";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.post(
  "/billing/create-checkout-session",
  requireAuth,
  createCheckoutSession,
);

router.post("/billing/select-free-plan", requireAuth, selectFreePlan);

export default router;
