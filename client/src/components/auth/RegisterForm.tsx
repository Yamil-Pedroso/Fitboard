/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useAuth } from "@/context/UserContext";
import { Link } from "@tanstack/react-router";

const RegisterForm = () => {
  const { register, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [okMsg, setOkMsg] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

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
      setOkMsg("Failed to create account.");
    }
  }

  return (
    <div
      className=" w-full

                    flex justify-center p-4 sm:p-6"
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl
                   border border-neutral-200
                   bg-white/80 backdrop-blur-xl
                   shadow-[0_20px_80px_rgba(0,0,0,0.08)]
                   p-6 sm:p-8 text-black"
      >
        <div className="mb-6 flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl
                          bg-gradient-to-br from-lime-400 to-amber-300
                          text-black shadow-md"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 19a6 6 0 0 0-12 0"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M20 8v6M23 11h-6"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Create account
            </h2>
            <p className="text-sm text-neutral-500">
              Start your fitness journey today.
            </p>
          </div>
        </div>

        <Input
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        <Input
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="your_nickname"
          className="mt-4"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          show={showPw}
          setShow={setShowPw}
        />

        <PasswordInput
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          show={showPw2}
          setShow={setShowPw2}
        />

        <div className="mt-4 space-y-1">
          <label className="text-sm font-medium">Avatar (optional)</label>

          <label
            htmlFor="avatar"
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white/80 backdrop-blur px-3 py-2 text-sm cursor-pointer hover:bg-neutral-50"
          >
            <span className="text-neutral-600">
              {avatarFile ? avatarFile.name : "Upload image"}
            </span>

            <span className="text-lime-600 font-medium">
              {avatarFile ? "Change" : "Browse"}
            </span>
          </label>

          <input
            id="avatar"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? undefined)}
          />
        </div>

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

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-xl
                     bg-lime-400 text-black
                     px-4 py-2.5 font-semibold
                     shadow transition hover:bg-lime-300
                     disabled:opacity-60"
        >
          {isLoading ? "Creating…" : "Create account"}
        </button>

        <div className="mt-4 text-center text-sm">
          <span className="text-neutral-600">Already have an account? </span>
          <Link
            to="/auth/login"
            className="font-medium text-lime-600 hover:underline"
          >
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;

function Input({ label, value, onChange, placeholder, className = "" }: any) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="w-full rounded-xl border border-neutral-200
                   bg-white/80 backdrop-blur
                   px-3 py-2.5 text-sm outline-none transition
                   focus:ring-2 focus:ring-lime-400/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
      />
    </div>
  );
}

function PasswordInput({ label, value, onChange, show, setShow }: any) {
  return (
    <div className="mt-4 space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <div className="relative">
        <input
          className="w-full rounded-xl border border-neutral-200
                     bg-white/80 backdrop-blur
                     px-3 py-2.5 pr-12 text-sm outline-none transition
                     focus:ring-2 focus:ring-lime-400/30"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder="••••••••"
        />

        <button
          type="button"
          onClick={() => setShow((s: boolean) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-black"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
