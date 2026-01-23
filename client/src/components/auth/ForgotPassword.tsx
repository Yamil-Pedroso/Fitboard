/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { requestPasswordReset } from "@/services/usersService";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Only for DEV environment
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    setErr(null);
    setLoading(true);
    setDevResetLink(null);
    setPreview(null);

    try {
      const res = await requestPasswordReset(email);

      setOk(
        "If the email exists, we'll send you a link to reset your password.",
      );

      if (import.meta.env.MODE !== "production") {
        if (res.resetLink) setDevResetLink(res.resetLink);
        if (res.preview) setPreview(res.preview);
      }
    } catch {
      setOk(
        "If the email exists, we'll send you a link to reset your password.",
      );
      setErr(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-20 w-full bg-[radial-gradient(1200px_500px_at_100%_0%,#e9f5ff_0%,transparent_60%),radial-gradient(1000px_500px_at_0%_100%,#f5f3ff_0%,transparent_60%)] flex items-center justify-center p-4 sm:p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.06)] p-6 sm:p-8 text-black"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 text-white shadow-md">
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
              Forgot password
            </h1>
            <p className="text-sm text-neutral-500">
              We'll send you a link to reset your password if the email exists.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
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
                  fill="currentColor"
                  d="M20 4H4a2 2 0 0 0-2 2v.4l10 6.25L22 6.4V6a2 2 0 0 0-2-2Zm0 4.75L12.35 15a1 1 0 0 1-1 .02L4 8.75V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.75Z"
                />
              </svg>
            </span>
            <input
              id="email"
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

        <div className="mt-4 space-y-2">
          {ok && (
            <p
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              role="status"
              aria-live="polite"
            >
              {ok}
            </p>
          )}
          {err && (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
              aria-live="polite"
            >
              {err}
            </p>
          )}
        </div>

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
          {loading ? "Sending…" : "Send reset link"}
        </button>

        {import.meta.env.MODE !== "production" && (devResetLink || preview) && (
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-800">
            <p className="mb-2 font-medium">Dev helpers:</p>
            {devResetLink && (
              <p className="mb-1 break-words">
                Reset page:{" "}
                <a
                  href={devResetLink}
                  className="font-medium text-blue-700 underline"
                >
                  Open reset page
                </a>
              </p>
            )}
            {preview && (
              <p className="break-words">
                Email preview:{" "}
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-700 underline"
                >
                  Open Ethereal
                </a>
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
