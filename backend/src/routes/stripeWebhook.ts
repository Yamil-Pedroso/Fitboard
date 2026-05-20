import express from "express";
import { stripeWebhookHandler } from "../controllers/stripeWebhookController";

const router = express.Router();

router.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

export default router;
