import { Request, Response } from "express";
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
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!["pro", "elite"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    if (!["monthly", "yearly"].includes(period)) {
      return res.status(400).json({ error: "Invalid billing period" });
    }

    const user = await User.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
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

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Stripe checkout error:", error);

    return res.status(500).json({
      error: "Failed to create checkout session",
    });
  }
};

export const selectFreePlan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
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
      return res.status(404).json({ error: "User not found" });
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
