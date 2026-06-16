import { Link } from "@tanstack/react-router";
import { CreditCard, CalendarClock, Crown, XCircle } from "lucide-react";

import { useAuth } from "@/context/UserContext";

function formatDate(date?: string | Date | null) {
  if (!date) return "No renewal date";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function BillingSettingsCard() {
  const { user } = useAuth();

  const subscription = user?.subscription;

  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "active";
  const renewalDate = subscription?.currentPeriodEnd;

  const isPaidPlan = plan === "pro" || plan === "elite";

  return (
    <div className="settings-card rounded-2xl backdrop-blur-xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="settings-muted text-sm">
            Manage your subscription and billing status.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-100">
          <CreditCard className="h-5 w-5 text-lime-700" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="settings-subcard rounded-xl p-3">
          <p className="settings-muted text-xs">Current plan</p>
          <div className="mt-1 flex items-center gap-2 font-semibold capitalize">
            <Crown className="h-4 w-4 text-lime-600" />
            {plan}
          </div>
        </div>

        <div className="settings-subcard rounded-xl p-3">
          <p className="settings-muted text-xs">Status</p>
          <p className="mt-1 font-semibold capitalize">{status}</p>
        </div>

        <div className="settings-subcard rounded-xl p-3">
          <p className="settings-muted text-xs">Renewal date</p>
          <div className="mt-1 flex items-center gap-2 font-semibold">
            <CalendarClock className="h-4 w-4 text-lime-600" />
            {formatDate(renewalDate)}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          hash="pricing"
          className="flex flex-1 items-center justify-center rounded-xl bg-lime-400 px-4 py-2 font-semibold text-black hover:bg-lime-300"
        >
          Change plan
        </Link>

        {isPaidPlan && (
          <Link
            to="/billing/cancel-subscription"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100"
          >
            <XCircle className="h-4 w-4" />
            Cancel subscription
          </Link>
        )}
      </div>
    </div>
  );
}
