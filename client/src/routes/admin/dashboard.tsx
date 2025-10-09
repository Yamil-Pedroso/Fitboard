import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";
import UsersAdminPage from "@/components/dashboard/admin/AdminDashboard";

function AdminDashboardRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!user?.isAdmin) return <Navigate to="/" />;
  return <UsersAdminPage />;
}

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardRoute,
});
