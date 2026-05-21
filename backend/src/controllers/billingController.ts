import { Request, Response } from "express";
import Stripe from "stripe";

import { stripe } from "../utils/stripe";
import { User } from "../models/User";

type BillingPlan = "pro" | "elite";
type BillingPeriod = "monthly" | "yearly";

type AuthRequest = Request & {
  auth?: {
    userId: string;
    isAdmin?: boolean;
  };
};

const getPriceId = (plan: BillingPlan, period: BillingPeriod) => {
  const priceMap: Record<
    BillingPlan,
    Record<BillingPeriod, string | undefined>
  > = {
    pro: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    },

    elite: {
      monthly: process.env.STRIPE_ELITE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_ELITE_YEARLY_PRICE_ID,
    },
  };

  return priceMap[plan]?.[period];
};

export const createCheckoutSession = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { plan, period } = req.body as {
      plan: BillingPlan;
      period: BillingPeriod;
    };

    if (!req.auth?.userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!["pro", "elite"].includes(plan)) {
      return res.status(400).json({
        error: "Invalid plan",
      });
    }

    if (!["monthly", "yearly"].includes(period)) {
      return res.status(400).json({
        error: "Invalid billing period",
      });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const priceId = getPriceId(plan, period);

    if (!priceId) {
      return res.status(500).json({
        error: "Stripe price ID is not configured",
      });
    }

    const successUrl = process.env.STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.STRIPE_CANCEL_URL;

    if (!successUrl || !cancelUrl) {
      return res.status(500).json({
        error: "Stripe success/cancel URLs are not configured",
      });
    }

    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,

        metadata: {
          userId: user._id.toString(),
        },
      });

      stripeCustomerId = customer.id;

      user.subscription = {
        ...user.subscription,
        plan: user.subscription?.plan ?? "free",
        status: user.subscription?.status ?? "active",
        stripeCustomerId,
        stripeSubscriptionId: user.subscription?.stripeSubscriptionId ?? null,
        currentPeriodEnd: user.subscription?.currentPeriodEnd ?? null,
      };

      await user.save();
    }

    const metadata = {
      userId: user._id.toString(),
      plan,
      period,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      customer: stripeCustomerId,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,

      metadata,

      subscription_data: {
        metadata,
      },
    });

    console.log("✅ Checkout session created:", {
      userId: user._id.toString(),
      plan,
      period,
      stripeCustomerId,
      sessionId: session.id,
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("❌ Stripe checkout error:", error);

    return res.status(500).json({
      error: "Failed to create checkout session",
    });
  }
};

export const createSubscriptionPaymentIntent = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { plan, period } = req.body as {
      plan: BillingPlan;
      period: BillingPeriod;
    };

    if (!req.auth?.userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!["pro", "elite"].includes(plan)) {
      return res.status(400).json({
        error: "Invalid plan",
      });
    }

    if (!["monthly", "yearly"].includes(period)) {
      return res.status(400).json({
        error: "Invalid billing period",
      });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const priceId = getPriceId(plan, period);

    if (!priceId) {
      return res.status(500).json({
        error: "Stripe price ID is not configured",
      });
    }

    let stripeCustomerId = user.subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,

        metadata: {
          userId: user._id.toString(),
        },
      });

      stripeCustomerId = customer.id;

      user.subscription = {
        ...user.subscription,

        plan: user.subscription?.plan ?? "free",

        status: user.subscription?.status ?? "active",

        stripeCustomerId,

        stripeSubscriptionId: user.subscription?.stripeSubscriptionId ?? null,

        currentPeriodEnd: user.subscription?.currentPeriodEnd ?? null,
      };

      await user.save();
    }

    const metadata = {
      userId: user._id.toString(),
      plan,
      period,
    };

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,

      items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      payment_behavior: "default_incomplete",

      payment_settings: {
        save_default_payment_method: "on_subscription",
      },

      metadata,

      expand: ["latest_invoice.confirmation_secret"],
    });

    if (
      !subscription.latest_invoice ||
      typeof subscription.latest_invoice === "string"
    ) {
      return res.status(500).json({
        error: "Could not retrieve subscription invoice",
      });
    }

    const latestInvoice = subscription.latest_invoice as any;

    const clientSecret = latestInvoice.confirmation_secret?.client_secret;

    if (!clientSecret) {
      console.log("❌ latestInvoice:", latestInvoice);

      return res.status(500).json({
        error: "Could not retrieve payment client secret",
      });
    }

    user.subscription = {
      ...user.subscription,

      plan,

      status: "incomplete",

      stripeCustomerId,

      stripeSubscriptionId: subscription.id,

      currentPeriodEnd: null,
    };

    await user.save();

    console.log("✅ Stripe custom subscription created:", {
      userId: user._id.toString(),
      stripeCustomerId,
      subscriptionId: subscription.id,
      plan,
      period,
    });

    return res.status(200).json({
      clientSecret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("❌ Stripe custom subscription error:", error);

    return res.status(500).json({
      error: "Failed to create custom subscription payment",
    });
  }
};

export const selectFreePlan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.auth.userId,
      {
        $set: {
          subscription: {
            plan: "free",
            status: "active",
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
          },
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      message: "Free plan selected successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("❌ Select free plan error:", error);

    return res.status(500).json({
      error: "Failed to select free plan",
    });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.auth.userId);

    if (!user?.subscription?.stripeSubscriptionId) {
      return res.status(400).json({
        error: "No active subscription found",
      });
    }

    const canceledSubscription = await stripe.subscriptions.cancel(
      user.subscription.stripeSubscriptionId,
    );

    user.subscription = {
      ...user.subscription,
      plan: "free",
      status: "canceled",
      stripeCustomerId: user.subscription.stripeCustomerId,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    };

    await user.save();

    return res.status(200).json({
      message: "Subscription canceled successfully",
      subscription: user.subscription,
      stripeSubscription: canceledSubscription,
    });
  } catch (error) {
    console.error("❌ Cancel subscription error:", error);

    return res.status(500).json({
      error: "Failed to cancel subscription",
    });
  }
};
