import { useUsers } from "@/lib/hooks/admin/useUsers";
import { useAuth } from "@/context/UserContext";
import { Navigate } from "@tanstack/react-router";

export default function UsersAdminPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useUsers({ page: 1, limit: 20 });

  if (!user?.isAdmin) return <Navigate to="/" />;
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error)
    return <div className="p-6 text-red-600">Failed to load users</div>;

  const users = data?.users ?? [];

  return (
    <div className="p-6 space-y-3">
      {users.map((u) => (
        <div
          key={String(u._id)}
          className="flex items-center justify-between border p-3 rounded"
        >
          <div className="font-mono text-black">
            {u.username} — {u.email}
          </div>
          <span className="text-xs border rounded px-2">
            {u.isAdmin ? "admin" : "user"}
          </span>
        </div>
      ))}
    </div>
  );
}
