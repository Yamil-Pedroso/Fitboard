import { createFileRoute } from "@tanstack/react-router";

import CustomCheckout from "@/components/billing/CustomCheckout";

type Search = {
  plan: "pro" | "elite";
  period: "monthly" | "yearly";
};

export const Route = createFileRoute("/billing/custom-checkout")({
  validateSearch: (search): Search => {
    return {
      plan: search.plan === "elite" ? "elite" : "pro",

      period: search.period === "yearly" ? "yearly" : "monthly",
    };
  },

  component: CustomCheckoutPage,
});

function CustomCheckoutPage() {
  const search = Route.useSearch();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-20">
      <div className="mx-auto max-w-xl">
        <CustomCheckout plan={search.plan} period={search.period} />
      </div>
    </main>
  );
}
