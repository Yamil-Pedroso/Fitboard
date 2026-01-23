/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { changePassword } from "@/services/usersService";

export default function ChangePasswordForm() {
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
      className="mx-auto w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Change password</h2>

      <div className="space-y-1">
        <label className="text-sm">Current password</label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">New password</label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
          minLength={8}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Repeat new password</label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          required
        />
      </div>

      {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}
      {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
      >
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
