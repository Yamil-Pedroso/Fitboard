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

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Set a new password</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border p-6 shadow-sm"
      >
        <p className="text-xs text-gray-600 break-all">
          Email: <span className="font-mono">{email || "—"}</span>
        </p>
        <div className="space-y-1">
          <label className="text-sm text-black">New password</label>
          <input
            className="w-full rounded border px-3 py-2 text-black"
            type="password"
            value={pw1}
            onChange={(e) => setPw1(e.currentTarget.value)}
            minLength={8}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-black">Repeat password</label>
          <input
            className="w-full rounded border px-3 py-2 text-black"
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.currentTarget.value)}
            required
          />
        </div>
        {msg && <p className="text-sm text-green-600">{msg}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
