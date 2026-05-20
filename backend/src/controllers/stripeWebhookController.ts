import { Request, Response } from "express";
import { stripe } from "../utils/stripe";
import { User } from "../models/User";

type SubscriptionPlan = "pro" | "elite";

type StripeSubscriptionLike = {
  id: string;
  status: string;
  metadata?: {
    userId?: string;
    plan?: SubscriptionPlan;
    period?: "monthly" | "yearly";
  };
  customer?: string | null;
  items?: {
    data?: Array<{
      current_period_end?: number;
    }>;
  };
};

type StripeCheckoutSessionLike = {
  metadata?: {
    userId?: string;
    plan?: SubscriptionPlan;
    period?: "monthly" | "yearly";
  };
  customer?: string | null;
  subscription?: string | null;
};

const getSubscriptionPeriodEnd = (
  subscription: StripeSubscriptionLike,
): Date | null => {
  const periodEnd = subscription.items?.data?.[0]?.current_period_end;

  return periodEnd ? new Date(periodEnd * 1000) : null;
};

const updateUserSubscriptionFromStripe = async ({
  userId,
  plan,
  stripeCustomerId,
  stripeSubscriptionId,
  subscription,
}: {
  userId: string;
  plan: SubscriptionPlan;
  stripeCustomerId?: string | null;
  stripeSubscriptionId: string;
  subscription: StripeSubscriptionLike;
}) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "subscription.plan": plan,
        "subscription.status": subscription.status,
        "subscription.stripeCustomerId": stripeCustomerId ?? null,
        "subscription.stripeSubscriptionId": stripeSubscriptionId,
        "subscription.currentPeriodEnd": getSubscriptionPeriodEnd(subscription),
      },
    },
    { new: true },
  );

  console.log("✅ Mongo subscription updated:", {
    userId,
    plan,
    status: subscription.status,
    updated: Boolean(updatedUser),
  });

  return updatedUser;
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || Array.isArray(signature)) {
    return res.status(400).send("Missing or invalid Stripe signature");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).send("Missing Stripe webhook secret");
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook error";

    console.error("❌ Stripe webhook signature verification failed:", message);

    return res.status(400).send(`Webhook Error: ${message}`);
  }

  console.log("✅ Stripe webhook event:", event.type);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as StripeCheckoutSessionLike;

      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription;

      console.log("✅ Checkout completed metadata:", {
        userId,
        plan,
        stripeCustomerId,
        stripeSubscriptionId,
      });

      if (!userId || !plan || !stripeSubscriptionId) {
        console.warn("⚠️ Missing checkout session metadata:", {
          userId,
          plan,
          stripeCustomerId,
          stripeSubscriptionId,
        });

        return res.status(200).json({ received: true });
      }

      const subscription = (await stripe.subscriptions.retrieve(
        stripeSubscriptionId,
      )) as StripeSubscriptionLike;

      await updateUserSubscriptionFromStripe({
        userId,
        plan,
        stripeCustomerId,
        stripeSubscriptionId,
        subscription,
      });

      return res.status(200).json({ received: true });
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as StripeSubscriptionLike;

      const userId = subscription.metadata?.userId;
      const plan = subscription.metadata?.plan;

      console.log("✅ Subscription event metadata:", {
        eventType: event.type,
        userId,
        plan,
        subscriptionId: subscription.id,
      });

      if (!userId || !plan) {
        console.warn("⚠️ Missing subscription metadata:", {
          userId,
          plan,
          subscriptionId: subscription.id,
        });

        return res.status(200).json({ received: true });
      }

      await updateUserSubscriptionFromStripe({
        userId,
        plan,
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : null,
        stripeSubscriptionId: subscription.id,
        subscription,
      });

      return res.status(200).json({ received: true });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as StripeSubscriptionLike;

      const userId = subscription.metadata?.userId;

      console.log("✅ Subscription deleted metadata:", {
        userId,
        subscriptionId: subscription.id,
      });

      if (!userId) {
        console.warn("⚠️ Missing deleted subscription userId metadata");

        return res.status(200).json({ received: true });
      }

      await User.findByIdAndUpdate(userId, {
        $set: {
          "subscription.plan": "free",
          "subscription.status": "canceled",
          "subscription.stripeSubscriptionId": null,
          "subscription.currentPeriodEnd": null,
        },
      });

      return res.status(200).json({ received: true });
    }

    console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Stripe webhook processing error:", error);

    return res.status(500).send("Webhook processing failed");
  }
};
