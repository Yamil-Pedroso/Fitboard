import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";
import Settings from "@/components/settings/Settings";

export const Route = createFileRoute("/settings/")({
  component: SettingsRoute,
});

function SettingsRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!user)
    return <Navigate to="/auth/login" search={{ redirect: "/settings" }} />;

  return <Settings />;
}
