/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { resetPassword } from "@/services/usersService";

const ResetPasswordForm = () => {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // UI solo (no cambia funcionalidad)
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const t = qs.get("token") ?? "";
    const e = qs.get("email") ?? "";
    console.log("[RESET] token:", t);
    console.log("[RESET] email:", e);
    setToken(t);
    setEmail(e);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!token || !email) {
      setErr("Invalid reset link.");
      return;
    }
    if (pw1 !== pw2) {
      setErr("Passwords do not match.");
      return;
    }
    if (pw1.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, email, pw1);
      setMsg("Password updated. You can log in now.");
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Invalid or expired link.");
    } finally {
      setLoading(false);
    }
  }

  // ---- UI helpers (presentacional) ----
  const { label: strengthLabel, score } = getStrength(pw1);

  return (
    <div className="mt-20 w-full bg-[radial-gradient(1200px_500px_at_100%_0%,#e9f5ff_0%,transparent_60%),radial-gradient(1000px_500px_at_0%_100%,#f5f3ff_0%,transparent_60%)] flex items-center justify-center p-4 sm:p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.06)] p-6 sm:p-8 text-black"
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-md">
            {/* key/lock icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 10V7a6 6 0 1 1 12 0v3"
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
              <path d="M12 14v3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Set a new password
            </h1>
            <p className="text-sm text-neutral-500">
              Enter your new password and confirm it.
            </p>
          </div>
        </div>

        {/* Email mostrado (read-only) */}
        <p className="mb-4 break-all rounded-xl border border-neutral-200 bg-white/70 px-3 py-2 text-xs text-neutral-700">
          Email: <span className="font-mono">{email || "—"}</span>
        </p>

        {/* New password */}
        <div className="space-y-1">
          <label htmlFor="pw1" className="text-sm font-medium">
            New password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
              {/* lock icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="text-neutral-400"
              >
                <path
                  d="M6 10V7a6 6 0 1 1 12 0v3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              id="pw1"
              className="w-full rounded-xl border border-neutral-300 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200"
              type={show1 ? "text" : "password"}
              value={pw1}
              onChange={(e) => setPw1(e.currentTarget.value)}
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShow1((v) => !v)}
              className="absolute inset-y-0 right-2 grid place-items-center rounded-lg px-2 text-neutral-500 hover:text-neutral-700"
              aria-label={show1 ? "Hide password" : "Show password"}
            >
              {show1 ? (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M3 3l18 18M10.6 10.6A2 2 0 1 0 13.4 13.4"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M10.7 5.1A9.8 9.8 0 0 1 12 5c5 0 9.3 3.1 11 7.5a12.2 12.2 0 0 1-3.4 4.6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Indicador de fuerza (visual, no bloquea) */}
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-neutral-500">Password strength</span>
              <span className="font-medium text-neutral-700">
                {strengthLabel}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i < score
                      ? score <= 2
                        ? "bg-red-400"
                        : score === 3
                          ? "bg-yellow-400"
                          : "bg-emerald-500"
                      : "bg-neutral-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Repeat password */}
        <div className="mt-4 space-y-1">
          <label htmlFor="pw2" className="text-sm font-medium">
            Repeat password
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="text-neutral-400"
              >
                <path
                  d="M6 10V7a6 6 0 1 1 12 0v3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              id="pw2"
              className="w-full rounded-xl border border-neutral-300 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200"
              type={show2 ? "text" : "password"}
              value={pw2}
              onChange={(e) => setPw2(e.currentTarget.value)}
              required
              autoComplete="new-password"
              placeholder="Repeat your password"
            />
            <button
              type="button"
              onClick={() => setShow2((v) => !v)}
              className="absolute inset-y-0 right-2 grid place-items-center rounded-lg px-2 text-neutral-500 hover:text-neutral-700"
              aria-label={show2 ? "Hide password" : "Show password"}
            >
              {show2 ? (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M3 3l18 18M10.6 10.6A2 2 0 1 0 13.4 13.4"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M10.7 5.1A9.8 9.8 0 0 1 12 5c5 0 9.3 3.1 11 7.5a12.2 12.2 0 0 1-3.4 4.6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div className="mt-4 space-y-2">
          {msg && (
            <p
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              role="status"
            >
              {msg}
            </p>
          )}
          {err && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {err}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading && (
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
          {loading ? "Updating…" : "Update password"}
        </button>

        {/* Hint del enlace inválido (no altera validación) */}
        {!token || !email ? (
          <p className="mt-3 text-xs text-red-600">
            This reset link is missing data. Try requesting a new one.
          </p>
        ) : null}
      </form>
    </div>
  );
};

export default ResetPasswordForm;

/* ---------- helpers visuales ---------- */
function getStrength(pw: string): { label: string; score: number } {
  if (!pw) return { label: "—", score: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const label =
    score <= 1
      ? "Weak"
      : score === 2
        ? "Fair"
        : score === 3
          ? "Good"
          : "Strong";
  return { label, score };
}
