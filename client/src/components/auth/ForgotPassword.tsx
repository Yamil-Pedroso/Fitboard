import React, { useState } from "react";
import { requestPasswordReset } from "@/services/usersService";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Solo para DEV
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

      // Mensaje genérico (no filtra si el email existe)
      setOk(
        "Si el email existe, te enviaremos un enlace para restablecer la contraseña."
      );

      // En DEV, tu backend devuelve resetLink y preview
      if (import.meta.env.MODE !== "production") {
        if (res.resetLink) setDevResetLink(res.resetLink);
        if (res.preview) setPreview(res.preview);

        // (Opcional) redirigir automáticamente al resetLink:
        // if (res.resetLink) window.location.href = res.resetLink;
      }
    } catch (e: any) {
      setOk(
        "Si el email existe, te enviaremos un enlace para restablecer la contraseña."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Forgot password</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border p-6 shadow-sm"
      >
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

        {ok && <p className="text-sm text-green-600">{ok}</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      {/* Bloque visible solo en desarrollo */}
      {import.meta.env.MODE !== "production" && (devResetLink || preview) && (
        <div className="mt-4 rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">Dev helpers:</p>
          {devResetLink && (
            <p className="mb-1">
              Reset page:{" "}
              <a href={devResetLink} className="underline text-blue-700">
                Open reset page
              </a>
            </p>
          )}
          {preview && (
            <p>
              Email preview:{" "}
              <a
                href={preview}
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-700"
              >
                Open Ethereal
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
