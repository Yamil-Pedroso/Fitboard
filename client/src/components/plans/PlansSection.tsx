import React from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Rocket } from "lucide-react";

type BillingPeriod = "monthly" | "yearly";

type Plan = {
  id: "free" | "pro" | "elite";
  name: string;
  tagline: string;
  icon: React.ReactNode;
  monthly: number; // price per month
  yearly: number; // price per year (billed yearly)
  highlight?: boolean;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Start your journey",
    icon: <Rocket className="h-5 w-5" />,
    monthly: 0,
    yearly: 0,
    features: [
      "Meals log (basic)",
      "Up to 50 recipes",
      "Up to 5 routines",
      "Macro goals (single set)",
      "Basic progress tracking",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For committed lifters",
    icon: <Star className="h-5 w-5" />,
    monthly: 9,
    yearly: 90, // ~17% off
    highlight: true,
    features: [
      "Unlimited recipes & routines",
      "Timers (EMOM/Countdown)",
      "Duplicate & archive routines",
      "Advanced macro targets",
      "Image uploads for recipes",
      "Priority sync speed",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Everything, supercharged",
    icon: <Crown className="h-5 w-5" />,
    monthly: 19,
    yearly: 190, // ~17% off
    features: [
      "Everything in Pro",
      "Advanced analytics dashboard",
      "Export progress as CSV",
      "Coach tools (up to 5 clients)",
      "Priority support",
    ],
  },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const PlansSection: React.FC = () => {
  const [period, setPeriod] = React.useState<BillingPeriod>("monthly");

  return (
    <section id="pricing" className="relative py-16 md:py-24">
      {/* background flair */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-300/25 via-emerald-300/20 to-fuchsia-300/25 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Choose your plan
          </h2>
          <p className="mt-2 text-neutral-600">
            Simple pricing. Powerful features. Upgrade anytime.
          </p>

          {/* billing toggle */}
          <div className="mt-5 inline-flex items-center rounded-2xl border border-neutral-200 bg-white p-1 text-sm shadow-sm">
            <button
              className={`rounded-xl px-4 py-2 transition ${period === "monthly" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
              onClick={() => setPeriod("monthly")}
              aria-pressed={period === "monthly"}
            >
              Monthly
            </button>
            <button
              className={`rounded-xl px-4 py-2 transition ${period === "yearly" ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
              onClick={() => setPeriod("yearly")}
              aria-pressed={period === "yearly"}
            >
              Yearly
            </button>
            {period === "yearly" && (
              <span className="ml-2 hidden rounded-xl bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:inline-block">
                Save ~17%
              </span>
            )}
          </div>
        </div>

        {/* cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, idx) => {
            const isYearly = period === "yearly";
            const price = isYearly ? plan.yearly : plan.monthly;
            const unit = isYearly ? "/year" : "/month";
            const sub =
              isYearly && plan.yearly > 0
                ? `${formatCurrency(Math.round(plan.yearly / 12))}/mo billed yearly`
                : plan.monthly === 0
                  ? "Forever free"
                  : "";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className={`relative rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                  plan.highlight
                    ? "border-transparent bg-gradient-to-b from-white to-white/90 ring-2 ring-emerald-500/60"
                    : "border-2 border-neutral-800"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 right-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow">
                    <Star className="h-3.5 w-3.5" />
                    Most popular
                  </div>
                )}

                <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-1 text-sm text-neutral-800 ring-1 ring-inset ring-neutral-200">
                  {plan.icon}
                  <span className="font-medium">{plan.name}</span>
                </div>

                <div className="flex items-end gap-2">
                  <div className="text-4xl font-bold text-neutral-900">
                    {formatCurrency(price)}
                  </div>
                  <div className="pb-1 text-neutral-500">{unit}</div>
                </div>
                {sub && (
                  <div className="mt-1 text-sm text-neutral-600">{sub}</div>
                )}
                <p className="mt-3 text-neutral-600">{plan.tagline}</p>

                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-neutral-800"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-6 w-full rounded-xl px-4 py-2 text-sm font-medium transition ${
                    plan.id === "free"
                      ? "border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
                      : plan.highlight
                        ? "bg-neutral-900 text-white hover:opacity-90"
                        : "border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
                  }`}
                  onClick={() => {
                    // dummy action — wire to your checkout/signup later
                    // e.g., navigate({ to: "/settings/billing" })
                    console.log("Select plan:", plan.id, period);
                  }}
                >
                  {plan.id === "free"
                    ? "Get started"
                    : plan.id === "pro"
                      ? "Upgrade to Pro"
                      : "Go Elite"}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* footnote */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          Prices are example placeholders. You can change currency and discounts
          anytime.
        </p>
      </div>
    </section>
  );
};

export default PlansSection;
