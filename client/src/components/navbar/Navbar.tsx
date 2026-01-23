import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosNotificationsOff, IoIosNotifications } from "react-icons/io";
import { FiMenu, FiX } from "react-icons/fi";
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
        <span className=" text-sm font-medium">{user.username}</span>
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
            className="absolute mt-2
overflow-hidden rounded-xl
border border-[#393a3c] bg-[#393a3c]
shadow-lg text-right


md:right-0 md:left-auto md:translate-x-0 md:w-56


left-1/2 -translate-x-1/3 w-50
 z-30"
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
                className="w-full rounded-lg px-3 py-2 text-emerald-300 dark:hover:bg-neutral-800 text-right"
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

/* ------------------ NAVBAR ------------------ */
const Navbar = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        {/* LOGO */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold text-black whitespace-nowrap"
        >
          Fitness & Nutrition
        </Link>

        {/* DESKTOP SECTION */}
        <div className="hidden md:flex items-center gap-4">
          <div>
            {user ? (
              <IoIosNotifications className="size-7 ml-4 text-[#393a3c] cursor-pointer" />
            ) : (
              <IoIosNotificationsOff className="size-7 ml-4 text-[#393a3c] cursor-pointer" />
            )}
          </div>
          <TranslateComp />
          {user ? (
            <div className="flex items-center gap-3">
              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-3">
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

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden p-2 rounded-lg text-[#393a3c] hover:bg-gray-100 transition"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t border-gray-200 px-6 py-4 flex flex-col gap-4 "
          >
            <div className="flex justify-between items-center">
              {user ? (
                <>
                  <UserMenu />
                  <IoIosNotifications className="size-6 text-[#393a3c]" />
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/auth/login"
                    className="font-bold text-black hover:underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="font-bold text-black hover:underline"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <TranslateComp />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
