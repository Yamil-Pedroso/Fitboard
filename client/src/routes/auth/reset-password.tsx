import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordForm from "@/components/auth/ResetPassword";
export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  return <ResetPasswordForm />;
}
