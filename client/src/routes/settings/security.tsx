import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";
import ChangePasswordForm from "@/components/account/ChangePassword";

export const Route = createFileRoute("/settings/security")({
  component: SecurityRoute,
});

function SecurityRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!user)
    return (
      <Navigate to="/auth/login" search={{ redirect: "/settings/security" }} />
    );

  return (
    <div className="mx-auto w-full max-w-lg p-6">
      <h1 className="mb-4 text-2xl font-semibold">Security</h1>
      <ChangePasswordForm />
    </div>
  );
}
