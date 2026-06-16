import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
//import { IoIosNotificationsOff, IoIosNotifications } from "react-icons/io";
import { FiMenu, FiX } from "react-icons/fi";
//import TranslateComp from "../common/translate/TranslateComp";
import assets from "@/assets";
import { toast } from "sonner";

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
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-[#393a3c] backdrop-blur-md border border-white/20 rounded-full  px-3 py-1.5 hover:bg-[#2d2d2f] transition"
      >
        <span className="h-8 w-8 rounded-full overflow-hidden">
          <img
            src={user.avatar}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        </span>

        <span className="text-sm text-white sm:block">{user.username}</span>

        {user.isAdmin && (
          <span className="text-xs bg-lime-400 text-black px-2 py-0.5 rounded-full  sm:block">
            Admin
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="
              absolute mt-2
              w-56
              md:right-0
              max-w-[calc(100vw-2rem)]
              backdrop-blur-xl app-surface-strong shadow-xl rounded-xl overflow-hidden z-30
            "
          >
            <div className="px-4 py-3 text-sm truncate text-center app-text">
              {user.email}
            </div>

            <div className="h-px bg-[var(--app-border)]" />

            <nav className="p-1 text-sm text-right app-text">
              {[
                { to: "/user-profile", label: "Profile" },
                { to: "/meals", label: "Meals" },
                { to: "/recipes", label: "Recipes" },
                { to: "/routines", label: "Routines" },
                { to: "/progress", label: "Progress" },
                { to: "/settings", label: "Settings" },
                { to: "/settings/security", label: "Change password" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-[var(--app-surface-muted)] transition"
                >
                  {item.label}
                </Link>
              ))}

              {user.isAdmin && (
                <>
                  <div className="my-1 h-px bg-[var(--app-border)]" />
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-lg font-medium hover:bg-[var(--app-surface-muted)]"
                  >
                    Admin Dashboard
                  </Link>
                </>
              )}

              <Link
                to="/faqs"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-[var(--app-surface-muted)]"
              >
                FAQs
              </Link>

              <div className="my-1 h-px bg-[var(--app-border)]" />

              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full text-right px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition"
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
  const { user, login } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDemoLogin = async () => {
    try {
      await login("demo@example.com", "12345678");

      toast.success(
        "🚀 DEMO MODE ACTIVATED —> WELCOME ATHLETE 💪".toUpperCase(),
      );
    } catch (error) {
      console.error("Demo login failed:", error);

      toast.error("💀 OOPS... THE DEMO GOBLIN BROKE SOMETHING 👹");
    }
  };

  return (
    <nav className="top-0 left-0 w-full z-50 bg-black md:bg-transparent md:backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3">
        <Link
          to="/"
          className="w-15 h-15 flex items-center justify-center gap-2 bg-[#393a3c] rounded-full px-2 py-1 transition-all duration-300"
        >
          <motion.img
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.5,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            src={assets.logo}
            alt="Fitboard Logo"
            className="h-10 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center gap-5 app-muted">
          {!user ? (
            <div
              onClick={handleDemoLogin}
              className="bg-[#EAEBE9] text-black px-4 py-2 rounded-full font-semibold hover:scale-105 transition cursor-pointer"
            >
              Demo
            </div>
          ) : null}
          {/*{user ? (
            <IoIosNotifications className="size-6 hover:scale-110 transition cursor-pointer" />
          ) : (
            <IoIosNotificationsOff className="size-6 opacity-60 text-neutral-500" />
          )} */}

          {/*<TranslateComp />*/}

          {user ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/auth/login"
                className="bg-black text-lime-400 px-4 py-2 rounded-full font-semibold hover:scale-105 transition"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="bg-lime-400 text-black px-4 py-2 rounded-full font-semibold hover:scale-105 transition"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {!user ? (
          <div
            onClick={handleDemoLogin}
            className="md:hidden bg-[#EAEBE9] text-black px-4 py-2 rounded-full font-semibold hover:scale-105 transition cursor-pointer"
          >
            Demo
          </div>
        ) : null}

        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden px-4 pb-6 pt-2 flex flex-col gap-4 bg-black/80 backdrop-blur-xl"
          >
            {user ? (
              <div className="flex items-center justify-between">
                <UserMenu />
                {/*<IoIosNotifications className="size-6 text-neutral-400" />*/}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/auth/login" onClick={() => setMenuOpen(false)}>
                  <p className="bg-lime-400 text-black px-4 py-2 rounded-full text-center font-semibold">
                    Login
                  </p>
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="bg-lime-400 text-black px-4 py-2 rounded-full text-center font-semibold"
                >
                  Get started
                </Link>
              </div>
            )}

            {/*<div className="pt-2 border-t border-white/20">
              <TranslateComp />
            </div>*/}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
