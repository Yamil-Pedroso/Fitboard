import React, { useState } from "react";
import { requestPasswordReset } from "@/services/usersService";
import { TbLockPassword } from "react-icons/tb";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    <div className="w-full flex items-center justify-center p-4 sm:p-6">
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
            <TbLockPassword className="size-6" />
          </div>

          <div>
            <h1 className="text-xl font-semibold">Forgot password</h1>
            <p className="text-sm text-neutral-500">
              We'll send you a reset link if the email exists.
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>

          <input
            className="w-full rounded-xl border border-neutral-200
                       bg-white/80 backdrop-blur
                       px-3 py-2.5 text-sm outline-none transition
                       focus:ring-2 focus:ring-lime-400/30"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="mt-4 space-y-2">
          {ok && (
            <p className="rounded-lg border border-lime-300 bg-lime-50 px-3 py-2 text-sm text-lime-700">
              {ok}
            </p>
          )}
          {err && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl
                     bg-lime-400 text-black
                     px-4 py-2.5 font-semibold
                     shadow transition hover:bg-lime-300
                     disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        {import.meta.env.MODE !== "production" && (devResetLink || preview) && (
          <div
            className="mt-5 rounded-2xl border border-neutral-200
                          bg-white/70 p-4 text-sm text-neutral-800"
          >
            <p className="mb-2 font-medium">Dev helpers</p>

            {devResetLink && (
              <p className="break-words">
                Reset page:{" "}
                <a href={devResetLink} className="text-lime-600 underline">
                  Open
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
                  className="text-lime-600 underline"
                >
                  Open
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
