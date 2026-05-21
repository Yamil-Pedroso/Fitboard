import { useMutation } from "@tanstack/react-query";
import {
  cancelSubscription,
  createCheckoutSession,
  createSubscriptionPayment,
  selectFreePlan,
} from "../../services/billingService";

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
  });
};

export const useSelectFreePlan = () => {
  return useMutation({
    mutationFn: selectFreePlan,
  });
};

export const useCreateSubscriptionPayment = () => {
  return useMutation({
    mutationFn: createSubscriptionPayment,
  });
};

export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: cancelSubscription,
  });
};
