import { useMutation } from "@tanstack/react-query";
import {
  createCheckoutSession,
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
