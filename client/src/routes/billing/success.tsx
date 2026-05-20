import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/billing/success")({
  component: BillingSuccessPage,
});

function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f8faf5] px-4 py-16 text-neutral-900">
      <section className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border-2 border-neutral-900 bg-white p-8 text-center shadow-[8px_8px_0_#111]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-100 ring-2 ring-lime-300">
          <CheckCircle2 className="h-9 w-9 text-lime-700" />
        </div>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
          <Sparkles className="h-3.5 w-3.5" />
          Payment successful
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Thanks for upgrading your Fitboard plan!
        </h1>

        <p className="mt-4 max-w-xl text-neutral-600">
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
            className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            Go to settings
          </Link>
        </div>
      </section>
    </main>
  );
}
