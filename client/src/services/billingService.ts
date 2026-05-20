import api from "../api/axiosConfig";

export type BillingPlan = "pro" | "elite";
export type BillingPeriod = "monthly" | "yearly";

type CreateCheckoutSessionInput = {
  plan: BillingPlan;
  period: BillingPeriod;
};

type CreateCheckoutSessionResponse = {
  url: string;
};

type SelectFreePlanResponse = {
  message: string;
  subscription: {
    plan: "free";
    status: "active";
    stripeCustomerId: null;
    stripeSubscriptionId: null;
    currentPeriodEnd: null;
  };
};

export const createCheckoutSession = async ({
  plan,
  period,
}: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResponse> => {
  const { data } = await api.post<CreateCheckoutSessionResponse>(
    "/billing/create-checkout-session",
    { plan, period },
  );

  return data;
};

export const selectFreePlan = async (): Promise<SelectFreePlanResponse> => {
  const { data } = await api.post<SelectFreePlanResponse>(
    "/billing/select-free-plan",
  );

  return data;
};
