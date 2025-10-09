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
      /* error shown below */
      setOkMsg("Failed to sign in.");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold">Log in</h2>

      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input
          className="w-full rounded border px-3 py-2 text-black"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Password</label>
        <div className="flex gap-2">
          <input
            className="w-full rounded border px-3 py-2 text-black"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
          <button
            type="button"
            className="shrink-0 rounded border px-3 text-sm"
            onClick={() => setShowPw((s) => !s)}
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}

      <button
        type="submit"
        className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Signing in…" : "Sign in"}
      </button>

      <Link to="/auth/forgot-password" className="text-sm underline text-black">
        Forgot password?
      </Link>
    </form>
  );
};

export default LoginForm;
