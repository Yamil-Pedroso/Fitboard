import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, XCircle } from "lucide-react";

export const Route = createFileRoute("/billing/cancel")({
  component: BillingCancelPage,
});

function BillingCancelPage() {
  return (
    <main className="min-h-screen bg-[#fff8f4] px-4 py-16 text-neutral-900">
      <section className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border-2 border-neutral-900 bg-white p-8 text-center shadow-[8px_8px_0_#111]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 ring-2 ring-red-200">
          <XCircle className="h-9 w-9 text-red-600" />
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Payment canceled
        </h1>

        <p className="mt-4 max-w-xl text-neutral-600">
          No worries — your subscription was not completed and you have not been
          charged. You can choose a plan again whenever you are ready.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            hash="pricing"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to plans
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
