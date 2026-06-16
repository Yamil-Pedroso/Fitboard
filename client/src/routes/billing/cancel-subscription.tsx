import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, XCircle } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/UserContext";
import { useCancelSubscription } from "@/lib/hooks/useBilling";

export const Route = createFileRoute("/billing/cancel-subscription")({
  component: CancelSubscriptionPage,
});

function CancelSubscriptionPage() {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();

  const cancelMutation = useCancelSubscription();

  const currentPlan = user?.subscription?.plan ?? "free";
  const status = user?.subscription?.status ?? "active";

  const isFreePlan = currentPlan === "free";

  async function handleCancelSubscription() {
    try {
      await cancelMutation.mutateAsync();

      localStorage.removeItem("pendingPlan");
      localStorage.removeItem("pendingPeriod");

      await refreshMe();

      toast.success("🪦 Subscription canceled. Premium goblin retired.");

      navigate({
        to: "/settings",
      });
    } catch (error) {
      console.error("Cancel subscription error:", error);

      toast.error("💀 Could not cancel subscription. Billing goblin resisted.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-16 app-text">
      <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border-2 app-surface p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: 18 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 16,
          }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-2 ring-red-200"
        >
          <XCircle className="h-9 w-9 text-red-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="text-3xl font-black tracking-tight sm:text-4xl"
        >
          Cancel your subscription?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="mt-4 max-w-xl app-muted"
        >
          You are currently on the{" "}
          <strong className="capitalize">{currentPlan}</strong> plan with status{" "}
          <strong className="capitalize">{status}</strong>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          Canceling will stop your paid subscription in Stripe. Fitboard will
          return your account to the Free plan once the webhook confirms the
          cancellation.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.35 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <button
            type="button"
            onClick={handleCancelSubscription}
            disabled={cancelMutation.isPending || isFreePlan}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelMutation.isPending
              ? "Canceling..."
              : isFreePlan
                ? "No active paid plan"
                : "Cancel subscription"}
          </button>

          <Link
            to="/settings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>
        </motion.div>
      </motion.section>
    </main>
  );
}
