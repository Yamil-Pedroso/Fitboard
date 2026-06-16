import React, { useState } from "react";
import { useAuth } from "@/context/UserContext";
import { Link } from "@tanstack/react-router";

const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [okMsg, setOkMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg("");
    try {
      await login(email, password);
      setOkMsg("Signed in successfully.");
    } catch {
      setOkMsg("Failed to sign in.");
    }
  }

  return (
    <div
      className="w-full

                    flex items-center justify-center p-4 sm:p-6"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl
                   border app-surface backdrop-blur-xl
                   shadow-[0_20px_80px_rgba(0,0,0,0.08)]
                   p-6 sm:p-8"
      >
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl
                          bg-gradient-to-br from-lime-400 to-lime-200
                          text-black shadow-md"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10V7a5 5 0 1 1 10 0v3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="4"
                y="10"
                width="16"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm app-muted">
              Log in to continue your journey.
            </p>
          </div>
        </div>

        {/* EMAIL */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 grid place-items-center app-muted">
              ✉️
            </span>
            <input
              className="w-full rounded-xl border px-10 py-2.5 text-sm app-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="mt-4 space-y-1">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 grid place-items-center app-muted">
              🔒
            </span>

            <input
              className="w-full rounded-xl border px-10 py-2.5 pr-12 text-sm app-control"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute inset-y-0 right-2 px-2 text-xs app-muted hover:text-[var(--app-text)]"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* FEEDBACK */}
        <div className="mt-4 space-y-2">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {okMsg && (
            <p className="rounded-lg border border-lime-300 bg-lime-50 px-3 py-2 text-sm text-lime-700">
              {okMsg}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-xl
                     bg-lime-400 text-black
                     px-4 py-2.5 font-semibold
                     shadow transition hover:bg-lime-300
                     disabled:opacity-60"
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>

        {/* FOOTER */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="app-muted">Forgot password?</span>
          <Link
            to="/auth/forgot-password"
            className="font-medium text-lime-600 hover:underline"
          >
            Reset
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
