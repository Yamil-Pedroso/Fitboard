/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
//import { Navigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
//import { useAuth } from "@/context/UserContext";
import { useUsers } from "@/lib/hooks/admin/useUsers";
import {
  setUserAdmin,
  deactivateUser,
  deleteUser,
  type IUser,
} from "@/services/usersService";

type FilterActive = "all" | "active" | "inactive";

export default function UsersAdminPage() {
  //const { user } = useAuth();

  // Controles de listado
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    sort: "-createdAt" as const, // "-createdAt" | "createdAt" | "email" | "-email" | "username" | "-username"
    q: "" as string | undefined,
    active: undefined as boolean | undefined,
  });

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterActive>("all");

  // Hook de datos
  const { data, isLoading, error } = useUsers(params);
  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  // Derivados (para “stats” de esta página)
  const pageAdmins = useMemo(
    () => users.filter((u) => u.isAdmin).length,
    [users]
  );
  const pageActive = useMemo(
    () => users.filter((u) => u.active).length,
    [users]
  );

  // Debounce de búsqueda
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

  // Filtro de activos
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

  // ========== Mutations ==========
  const promoteDemote = useMutation({
    mutationFn: async (u: IUser) => {
      const next = !u.isAdmin;
      return setUserAdmin(u._id, next);
    },
    onSuccess: (updated) => {
      toast.success(
        updated.isAdmin ? "User promoted to admin" : "User demoted to regular"
      );
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? "Failed to toggle admin");
    },
  });

  const deactivate = useMutation({
    mutationFn: async (id: string) => {
      // Tu backend tiene solo “deactivate” (soft delete).
      // Para reactivar, más adelante puedes crear otro endpoint.
      return deactivateUser(id);
    },
    onSuccess: () => {
      toast.success("User deactivated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? "Failed to deactivate user");
    },
  });

  const removeUser = useMutation({
    mutationFn: async (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error ?? "Failed to delete user");
    },
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(total / (params.limit ?? 20)));

  return (
    <div className="mx-auto w-full max-w-6xl p-6 text-black">
      {/* Header + stats */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm opacity-70">
            Manage users: roles, status, and more.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total users" value={total} />
          <StatCard label="Admins (page)" value={pageAdmins} />
          <StatCard label="Active (page)" value={pageActive} />
        </div>
      </div>

      {/* Toolbar: search + filters + sort */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Search by email or username…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <select
          className="w-full rounded border px-3 py-2"
          value={activeFilter}
          onChange={(e) =>
            setActiveFilter(e.currentTarget.value as FilterActive)
          }
        >
          <option value="all">All users</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>

        <select
          className="w-full rounded border px-3 py-2"
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
          <option value="username">Username (A→Z)</option>
          <option value="-username">Username (Z→A)</option>
          <option value="email">Email (A→Z)</option>
          <option value="-email">Email (Z→A)</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-[860px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b">
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
                <Td colSpan={6} className="text-red-600">
                  Failed to load users.
                </Td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <Td colSpan={6}>No users found.</Td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={String(u._id)} className="border-t">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} alt={u.username} />
                      <div>
                        <div className="font-medium">{u.username}</div>
                        <div className="text-xs opacity-60 truncate max-w-[220px]">
                          {String(u._id)}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td className="truncate max-w-[240px]">{u.email}</Td>
                  <Td>
                    <Badge tone={u.isAdmin ? "purple" : "gray"}>
                      {u.isAdmin ? "admin" : "user"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={u.active ? "green" : "red"}>
                      {u.active ? "active" : "inactive"}
                    </Badge>
                  </Td>
                  <Td>{formatDate(u.createdAt)}</Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="rounded border px-2 py-1 hover:bg-black/5"
                        disabled={promoteDemote.isPending}
                        onClick={() => promoteDemote.mutate(u)}
                        title={
                          u.isAdmin ? "Demote to user" : "Promote to admin"
                        }
                      >
                        {promoteDemote.isPending
                          ? "…"
                          : u.isAdmin
                            ? "Demote"
                            : "Promote"}
                      </button>

                      <button
                        className="rounded border px-2 py-1 hover:bg-black/5 disabled:opacity-50"
                        disabled={deactivate.isPending || !u.active}
                        onClick={() => {
                          if (!u.active) return;
                          if (confirm(`Deactivate ${u.username}?`)) {
                            deactivate.mutate(u._id);
                          }
                        }}
                        title={
                          u.active ? "Deactivate user" : "Already inactive"
                        }
                      >
                        {deactivate.isPending ? "…" : "Deactivate"}
                      </button>

                      <button
                        className="rounded border px-2 py-1 text-red-600 hover:bg-red-50"
                        disabled={removeUser.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              `Delete ${u.username}? This cannot be undone.`
                            )
                          ) {
                            removeUser.mutate(u._id);
                          }
                        }}
                      >
                        {removeUser.isPending ? "…" : "Delete"}
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="opacity-70">
          Page {params.page} of {totalPages} — Total: {total}
        </span>
        <div className="space-x-2">
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            disabled={params.page <= 1}
            onClick={() =>
              setParams((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
            }
          >
            Prev
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            disabled={params.page >= totalPages}
            onClick={() =>
              setParams((p) => ({
                ...p,
                page: Math.min(totalPages, p.page + 1),
              }))
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== UI helpers ================== */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Avatar({ src, alt }: { src?: string; alt: string }) {
  const fallback = "https://placehold.co/64x64?text=U";
  return (
    <span className="block h-10 w-10 overflow-hidden rounded-full border bg-white">
      <img
        src={src || fallback}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = fallback;
        }}
      />
    </span>
  );
}

function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "purple" | "gray";
}) {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-violet-50 text-violet-700 border-violet-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  } as const;
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${map[tone]}`}
    >
      {children}
    </span>
  );
}

function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th className={`p-2 text-left font-medium ${right ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function Td({
  children,
  right,
  colSpan,
  className = "",
}: {
  children: React.ReactNode;
  right?: boolean;
  colSpan?: number;
  className?: string;
}) {
  return (
    <td
      className={`p-2 align-middle ${right ? "text-right" : ""} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

function formatDate(d?: string) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}
