// src/components/Navbar.tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative bg-bg2-color" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-black/20"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-black">
          <img
            src={user.avatar}
            alt={user.username}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </span>
        <span className="hidden sm:block text-sm font-medium">
          {user.username}
        </span>
        <span>{user.isAdmin ? <p className="">Admin</p> : ""}</span>
        <svg
          className="size-4 opacity-70 cursor-pointer"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg text-right"
        >
          <div className="px-4 py-3 text-sm text-black">
            <div className="truncate opacity-70">{user.email}</div>
          </div>
          <div className="h-px bg-black/10" />
          <nav className="p-1 text-sm text-black">
            <Link
              to="/settings"
              className="block rounded-lg px-3 py-2 hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
            <Link
              to="/settings/security"
              className="block rounded-lg px-3 py-2 hover:bg-black/5"
              onClick={() => setOpen(false)}
            >
              Change password
            </Link>

            {user.isAdmin && (
              <>
                <div className="my-1 h-px bg-black/10" />
                <Link
                  to="/admin/dashboard"
                  className="block rounded-lg px-3 py-2 font-medium text-black hover:bg-black/5"
                  onClick={() => setOpen(false)}
                >
                  Admin Dashboard
                </Link>
              </>
            )}

            <div className="my-1 h-px bg-black/10" />
            <button
              className="w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 text-right"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-20 border-b bg-bg2-color backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-base font-bold">
          Fitness & Nutrition
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="hover:underline">
              Login
            </Link>
            <Link to="/auth/register" className="hover:underline">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
