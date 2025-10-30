/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { changePassword } from "@/services/usersService";

const ChangePasswordForm = () => {
  const [current, setCurrent] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg(null);
    setErrMsg(null);

    if (pw1 !== pw2) return setErrMsg("Passwords do not match.");
    if (pw1.length < 8)
      return setErrMsg("Password must be at least 8 characters.");

    try {
      setLoading(true);
      await changePassword(current, pw1);
      setOkMsg("Password updated successfully.");
      setCurrent("");
      setPw1("");
      setPw2("");
    } catch (e: any) {
      const msg =
        e?.response?.status === 401 &&
        e?.response?.data?.error === "Invalid current password"
          ? "Your current password is incorrect."
          : e?.response?.data?.error || "Could not update password.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200/70 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-8"
    >
      {/* Header con icono */}
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-400/90 to-cyan-400/90 text-white shadow-md ring-1 ring-white/30">
          {/* Lock icon */}
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V8a5 5 0 0 1 10 0v3" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Change password
          </h2>
          <p className="text-sm text-neutral-500">
            Use a strong password (min. 8 characters).
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {okMsg && (
        <p
          role="status"
          className="mb-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {okMsg}
        </p>
      )}
      {errMsg && (
        <p
          role="alert"
          className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errMsg}
        </p>
      )}

      <fieldset disabled={loading} className="space-y-4">
        {/* Current */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-800">
            Current password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-black outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-emerald-200"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {/* New */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-800">
            New password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-black outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-emerald-200"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
          />
          <p className="text-xs text-neutral-500">Minimum 8 characters.</p>
        </div>

        {/* Repeat */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-800">
            Repeat new password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-black outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-emerald-200"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 font-medium text-white shadow transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"
                />
              </svg>
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </button>
      </fieldset>
    </form>
  );
};

export default ChangePasswordForm;
