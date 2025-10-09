import React, { useState } from "react";
import { useAuth } from "@/context/UserContext";

const RegisterForm = () => {
  const { register, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [okMsg, setOkMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOkMsg("");
    if (password !== confirm) {
      return alert("Passwords do not match");
    }
    try {
      await register({ email, username, password, avatarFile });
      setOkMsg("Account created and you are logged in!");
    } catch {
      /* error shown below */
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-black">Create account</h2>

      <div className="space-y-1">
        <label className="text-sm text-black">Email</label>
        <input
          className="w-full rounded border px-3 py-2 text-black"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-black">Username</label>
        <input
          className="w-full rounded border px-3 py-2 text-black"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          required
          minLength={3}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-black">Password</label>
        <input
          className="w-full rounded border px-3 py-2 text-black"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          minLength={8}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-black">Confirm password</label>
        <input
          className="w-full rounded border px-3 py-2 text-black"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.currentTarget.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-black">Avatar (optional)</label>
        <input
          className="w-full text-black"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] ?? undefined)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}

      <button
        type="submit"
        className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
};

export default RegisterForm;
