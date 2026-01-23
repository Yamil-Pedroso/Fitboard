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
    <div className=" w-full mt-20 bg-[radial-gradient(1200px_500px_at_100%_0%,#e9f5ff_0%,transparent_60%),radial-gradient(1000px_500px_at_0%_100%,#f5f3ff_0%,transparent_60%)] flex items-center justify-center p-4 sm:p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.06)] p-6 sm:p-8 text-black"
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-md">
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
            <h2 className="text-xl font-semibold tracking-tight">Log in</h2>
            <p className="text-sm text-neutral-500">
              Welcome back! Please enter your details.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="text-neutral-400"
              >
                <path
                  fill="currentColor"
                  d="M20 4H4a2 2 0 0 0-2 2v.4l10 6.25L22 6.4V6a2 2 0 0 0-2-2Zm0 4.75L12.35 15a1 1 0 0 1-1 .02L4 8.75V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.75Z"
                />
              </svg>
            </span>
            <input
              className="w-full rounded-xl border border-neutral-300 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="text-neutral-400"
              >
                <path
                  fill="currentColor"
                  d="M14 3a5 5 0 0 0-4.9 6.1L2 16.2V20h3.8l1.5-1.5H9v-1.7l2.1-2.1A5 5 0 1 0 14 3Zm0 2a3 3 0 1 1-2.83 4H11l.29-.29A3 3 0 0 1 14 5Z"
                />
              </svg>
            </span>
            <input
              className="w-full rounded-xl border border-neutral-300 bg-white px-10 py-2.5 pr-12 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute inset-y-0 right-2 grid place-items-center rounded-lg px-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M2 3.27L3.28 2 22 20.72 20.73 22l-2.4-2.4A10.9 10.9 0 0 1 12 20C6 20 2 12 2 12a20.5 20.5 0 0 1 5.1-6.73L2 3.27ZM7.72 8l1.53 1.53A4 4 0 0 0 8 12a4 4 0 0 0 4 4c.86 0 1.65-.27 2.3-.73L16.28 16A6 6 0 0 1 12 18a6 6 0 0 1-6-6c0-.76.13-1.48.36-2.14L7.72 8ZM12 6a6 6 0 0 1 6 6c0 .69-.1 1.35-.3 1.96l-1.6-1.6c.06-.12.1-.25.1-.36a3 3 0 0 0-3-3c-.11 0-.24.04-.36.1L10.04 7.7c.62-.2 1.28-.3 1.96-.3Z"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {error && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}
          {okMsg && (
            <p
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              role="status"
              aria-live="polite"
            >
              {okMsg}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-white transition hover:bg-neutral-800 disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading && (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-80"
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          )}
          {isLoading ? "Signing in…" : "Sign in"}
        </button>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-neutral-500">Forgot your password?</span>
          <Link
            to="/auth/forgot-password"
            className="font-medium text-neutral-900 underline underline-offset-4 hover:opacity-90"
          >
            Reset it
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
