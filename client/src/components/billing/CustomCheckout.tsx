import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useAuth } from "@/context/UserContext";

import { loadStripe } from "@stripe/stripe-js";

import { toast } from "sonner";

import { useCreateSubscriptionPayment } from "@/lib/hooks/useBilling";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type Props = {
  plan: "pro" | "elite";
  period: "monthly" | "yearly";
};

export default function CustomCheckout({ plan, period }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createSubscriptionMutation = useCreateSubscriptionPayment();

  const handleInitializeCheckout = async () => {
    try {
      const data = await createSubscriptionMutation.mutateAsync({
        plan,
        period,
      });

      setClientSecret(data.clientSecret);

      toast.success("🚀 CHECKOUT PORTAL ACTIVATED 💳");
    } catch (error) {
      console.error(error);

      toast.error("💀 Stripe goblin destroyed the checkout portal.");
    }
  };

  if (!clientSecret) {
    return (
      <div className="rounded-3xl border-2 app-surface p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Custom Checkout</h2>

        <p className="mt-2 app-muted">
          Subscribe to the{" "}
          <span className="font-semibold capitalize">{plan}</span> plan.
        </p>

        <div className="mt-5 rounded-2xl border-2 border-lime-400 bg-lime-50 p-4">
          <h3 className="font-bold">Demo payment mode 🧪</h3>

          <p className="mt-2 text-sm app-muted">
            Use this Stripe test card:
          </p>

          <div className="mt-3 rounded-xl border app-surface-strong p-3 font-mono text-sm">
            4242 4242 4242 4242
          </div>

          <div className="mt-3 space-y-1 text-xs app-muted">
            <p>Expiry → Any future date</p>
            <p>CVC → Any 3 digits</p>
            <p>ZIP → Any ZIP code</p>
          </div>
        </div>

        <button
          onClick={handleInitializeCheckout}
          disabled={createSubscriptionMutation.isPending}
          className="mt-5 w-full rounded-2xl bg-lime-400 px-4 py-3 font-semibold text-black transition hover:scale-[1.01] disabled:opacity-50"
        >
          {createSubscriptionMutation.isPending
            ? "Preparing checkout..."
            : "Continue to payment 🚀"}
        </button>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,

        appearance: {
          theme: "stripe",

          variables: {
            colorPrimary: "#a3e635",
            borderRadius: "14px",
          },
        },
      }}
    >
      <CheckoutForm />
    </Elements>
  );
}

function CheckoutForm() {
  const stripe = useStripe();

  const { refreshMe } = useAuth();

  const elements = useElements();

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    try {
      setLoading(true);

      const { error } = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url: `${window.location.origin}/billing/success`,
        },

        redirect: "if_required",
      });

      if (error) {
        toast.error(`💀 ${error.message}`);
        return;
      }

      toast.success("🚀 PAYMENT COMPLETED — BEAST MODE ACTIVATED 💪");

      localStorage.removeItem("pendingPlan");
      localStorage.removeItem("pendingPeriod");

      await refreshMe();

      navigate({
        to: "/billing/success",
      });
    } catch (error) {
      console.error(error);

      toast.error("👹 The payment goblin escaped with your macros.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border-2 app-surface p-6 shadow-sm"
    >
      <h2 className="text-2xl font-bold">Payment Details</h2>

      <p className="mt-2 text-sm app-muted">Stripe test card:</p>

      <div className="mt-2 rounded-xl border app-surface-strong p-3 font-mono text-sm">
        4242 4242 4242 4242
      </div>
      <div className="mt-5 rounded-2xl border app-border p-4">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-5 w-full rounded-2xl bg-lime-400 px-4 py-3 font-semibold text-black transition hover:scale-[1.01] disabled:opacity-50"
      >
        {loading ? "Processing payment..." : "Complete payment 💳"}
      </button>
    </form>
  );
}
