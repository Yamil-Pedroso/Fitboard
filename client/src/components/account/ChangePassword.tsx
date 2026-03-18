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
      className="mx-auto w-full  max-w-md rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-6 shadow-xl sm:p-8"
    >
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="grid h-12 w-12 place-items-center rounded-xl
                        bg-gradient-to-br from-lime-400 to-amber-300
                        text-black shadow-md"
        >
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

      {/* SUCCESS */}
      {okMsg && (
        <p className="mb-4 rounded-lg border border-lime-300 bg-lime-50 px-3 py-2 text-sm text-lime-700">
          {okMsg}
        </p>
      )}

      {/* ERROR */}
      {errMsg && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errMsg}
        </p>
      )}

      <fieldset disabled={loading} className="space-y-4">
        {/* CURRENT */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-800">
            Current password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-neutral-200
                       bg-white/80 backdrop-blur
                       px-3 py-2 text-black outline-none transition
                       focus:ring-2 focus:ring-lime-400/30"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>

        {/* NEW */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-800">
            New password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-neutral-200
                       bg-white/80 backdrop-blur
                       px-3 py-2 text-black outline-none transition
                       focus:ring-2 focus:ring-lime-400/30"
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            minLength={8}
            required
          />
          <p className="text-xs text-neutral-500">Minimum 8 characters.</p>
        </div>

        {/* REPEAT */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-800">
            Repeat new password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-neutral-200
                       bg-white/80 backdrop-blur
                       px-3 py-2 text-black outline-none transition
                       focus:ring-2 focus:ring-lime-400/30"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-2
                     rounded-xl bg-lime-400 text-black
                     px-4 py-2.5 font-semibold
                     shadow transition hover:bg-lime-300
                     disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"
                  fill="currentColor"
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
