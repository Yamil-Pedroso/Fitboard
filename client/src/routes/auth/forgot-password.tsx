import { createFileRoute, Navigate } from "@tanstack/react-router";
import ForgotPasswordForm from "@/components/auth/ForgotPassword";
import { useAuth } from "@/context/UserContext";

function ForgotPasswordRouteComponent() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return <ForgotPasswordForm />;
}

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordRouteComponent,
});
