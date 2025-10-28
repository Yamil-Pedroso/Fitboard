import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosNotificationsOff, IoIosNotifications } from "react-icons/io";
import TranslateComp from "../common/translate/TranslateComp";

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
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center gap-2 bg-[#393a3c] rounded-full px-2 py-1"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-block h-8 w-8 overflow-hidden rounded-full ">
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

      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              stiffness: 120,
            }}
            role="menu"
            className="absolute right-0 mt-1 w-56 overflow-hidden rounded-xl border border-[#393a3c] bg-[#393a3c] shadow-lg text-right"
          >
            <div className="px-4 py-3 text-sm">
              <div className="truncate opacity-70">{user.email}</div>
            </div>
            <div className="h-px bg-black/10" />
            <nav className="p-1 text-sm ">
              <Link
                to="/user-profile"
                className="block rounded-lg px-3 py-2 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/meals"
                className="block rounded-lg px-3 py-2 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Meals
              </Link>
              <Link
                to="/recipes"
                className="block rounded-lg px-3 py-2 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Recipes
              </Link>
              <Link
                to="/routines"
                className="block rounded-lg px-3 py-2 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Routines
              </Link>
              <Link
                to="/progress"
                className="block rounded-lg px-3 py-2 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Progress
              </Link>
              <Link
                to="/settings"
                className="block rounded-lg px-3 py-2 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
              <Link
                to="/settings/security"
                className="block rounded-lg px-3 py-2 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                Change password
              </Link>

              {user.isAdmin && (
                <>
                  <div className="my-1 h-px bg-black/10" />
                  <Link
                    to="/admin/dashboard"
                    className="block rounded-lg px-3 py-2 font-medium dark:hover:bg-neutral-800"
                    onClick={() => setOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                </>
              )}

              <Link
                to="/faqs"
                className="block rounded-lg px-3 py-2 dark:hover:bg-neutral-800"
                onClick={() => setOpen(false)}
              >
                FAQs
              </Link>

              <div className="my-1 h-px bg-black/10" />
              <button
                className="w-full rounded-lg px-3 py-2  text-emerald-300 dark:hover:bg-neutral-800 text-right"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
              >
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-20 backdrop-blur">
      <div className="mx-auto flex  items-center justify-between px-12 py-3">
        <Link to="/" className="text-2xl font-bold text-black">
          Fitness & Nutrition
        </Link>

        <div className="flex items-center gap-4">
          <div>
            {user ? (
              <IoIosNotifications className="size-7 ml-4 text-[#393a3c]  cursor-pointer" />
            ) : (
              <IoIosNotificationsOff className="size-7 ml-4 text-[#393a3c] cursor-pointer" />
            )}
          </div>

          <div>
            <TranslateComp />
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-3 ">
              <Link
                to="/auth/login"
                className="hover:underline font-bold text-black"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="hover:underline font-bold text-black"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
