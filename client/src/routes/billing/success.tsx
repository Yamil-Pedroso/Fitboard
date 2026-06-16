import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/billing/success")({
  component: BillingSuccessPage,
});

function BillingSuccessPage() {
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
          initial={{ scale: 0, rotate: -18 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 260,
            damping: 16,
          }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-100 ring-2 ring-lime-300"
        >
          <CheckCircle2 className="h-9 w-9 text-lime-700" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="mb-3 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Payment successful
        </motion.div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Thanks for upgrading your Fitboard plan!
        </h1>

        <p className="mt-4 max-w-xl app-muted">
          Your subscription was completed successfully. Your premium features
          will be available as soon as your account syncs with Stripe.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to home
          </Link>

          <Link
            to="/settings"
            className="rounded-xl border px-5 py-2.5 text-sm font-semibold app-secondary-action transition"
          >
            Go to settings
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
