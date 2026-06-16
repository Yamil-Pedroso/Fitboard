/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUsers } from "@/lib/hooks/admin/useUsers";
import {
  setUserAdmin,
  deactivateUser,
  deleteUser,
  type IUser,
} from "@/services/usersService";

type FilterActive = "all" | "active" | "inactive";

export default function UsersAdminPage() {
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    sort: "-createdAt" as const,
    q: "" as string | undefined,
    active: undefined as boolean | undefined,
  });

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterActive>("all");

  const { data, isLoading, error } = useUsers(params);
  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  const pageAdmins = useMemo(
    () => users.filter((u) => u.isAdmin).length,
    [users],
  );
  const pageActive = useMemo(
    () => users.filter((u) => u.active).length,
    [users],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setParams((p) => ({
        ...p,
        page: 1,
        q: search.trim() ? search.trim() : undefined,
      }));
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setParams((p) => ({
      ...p,
      page: 1,
      active:
        activeFilter === "all"
          ? undefined
          : activeFilter === "active"
            ? true
            : false,
    }));
  }, [activeFilter]);

  const qc = useQueryClient();

  const promoteDemote = useMutation({
    mutationFn: async (u: IUser) => {
      return setUserAdmin(u._id, !u.isAdmin);
    },
    onSuccess: (updated) => {
      toast.success(
        updated.isAdmin ? "User promoted to admin" : "User demoted",
      );
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deactivate = useMutation({
    mutationFn: async (id: string) => deactivateUser(id),
    onSuccess: () => {
      toast.success("User deactivated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const removeUser = useMutation({
    mutationFn: async (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const totalPages = Math.max(1, Math.ceil(total / params.limit));

  return (
    <div className="mx-auto w-full max-w-6xl p-6 app-text">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold app-text">
            Admin Dashboard
          </h1>
          <p className="text-sm app-muted">
            Manage users, roles and status.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total users" value={total} />
          <StatCard label="Admins" value={pageAdmins} />
          <StatCard label="Active" value={pageActive} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          className="w-full rounded-xl border px-3 py-2 text-sm app-control shadow-sm"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <select
          className="w-full rounded-xl border px-3 py-2 text-sm app-control shadow-sm"
          value={activeFilter}
          onChange={(e) =>
            setActiveFilter(e.currentTarget.value as FilterActive)
          }
        >
          <option value="all">All users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          className="w-full rounded-xl border px-3 py-2 text-sm app-control shadow-sm"
          value={params.sort}
          onChange={(e) =>
            setParams((p) => ({
              ...p,
              sort: e.currentTarget.value as typeof p.sort,
            }))
          }
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="username">Username A-Z</option>
          <option value="-username">Username Z-A</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border app-surface backdrop-blur shadow-sm">
        <table className="min-w-[860px] w-full text-sm">
          <thead className="bg-[var(--app-surface-muted)]">
            <tr className="border-b app-border">
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th right>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <Td colSpan={6}>Loading…</Td>
              </tr>
            ) : error ? (
              <tr>
                <Td colSpan={6}>Error loading users</Td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={String(u._id)} className="border-t app-border">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} alt={u.username} />
                      <div>
                        <div className="font-medium">{u.username}</div>
                        <div className="text-xs opacity-60">{u._id}</div>
                      </div>
                    </div>
                  </Td>

                  <Td>{u.email}</Td>

                  <Td>
                    <Badge tone={u.isAdmin ? "lime" : "gray"}>
                      {u.isAdmin ? "admin" : "user"}
                    </Badge>
                  </Td>

                  <Td>
                    <Badge tone={u.active ? "lime" : "red"}>
                      {u.active ? "active" : "inactive"}
                    </Badge>
                  </Td>

                  <Td>{formatDate(u.createdAt)}</Td>

                  <Td right>
                    <div className="flex gap-2 justify-end">
                      <button
                        className="rounded-lg border px-2 py-1 text-sm app-secondary-action"
                        onClick={() => promoteDemote.mutate(u)}
                      >
                        {u.isAdmin ? "Demote" : "Promote"}
                      </button>

                      <button
                        className="rounded-lg border px-2 py-1 text-sm app-secondary-action"
                        onClick={() => deactivate.mutate(u._id)}
                      >
                        Deactivate
                      </button>

                      <button
                        className="rounded-lg border px-2 py-1 text-sm text-red-500 hover:bg-red-50"
                        onClick={() => removeUser.mutate(u._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between text-sm app-muted">
        <span>
          Page {params.page} / {totalPages}
        </span>

        <div className="space-x-2">
          <button
            className="rounded-lg border px-3 py-1 app-secondary-action"
            onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
          >
            Prev
          </button>
          <button
            className="rounded-lg border px-3 py-1 app-secondary-action"
            onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border app-surface backdrop-blur p-4 shadow-sm">
      <p className="text-xs app-muted">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Avatar({ src, alt }: { src?: string; alt: string }) {
  return (
    <span className="h-10 w-10 rounded-full overflow-hidden border">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </span>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "lime" | "red" | "gray";
}) {
  const styles = {
    lime: "bg-lime-100 text-black border-lime-300",
    red: "bg-red-100 text-red-700 border-red-200",
    gray: "bg-neutral-100 app-muted border-neutral-200",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full border ${styles[tone]}`}>
      {children}
    </span>
  );
}

function Th({ children, right }: any) {
  return <th className={`p-2 ${right ? "text-right" : ""}`}>{children}</th>;
}

function Td({ children, right, colSpan }: any) {
  return (
    <td className={`p-2 ${right ? "text-right" : ""}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

function formatDate(d?: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}
