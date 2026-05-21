import express from "express";
import {
  cancelSubscription,
  createCheckoutSession,
  createSubscriptionPaymentIntent,
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

router.post(
  "/billing/create-subscription-payment",
  requireAuth,
  createSubscriptionPaymentIntent,
);

export default router;

router.post("/billing/cancel-subscription", requireAuth, cancelSubscription);
