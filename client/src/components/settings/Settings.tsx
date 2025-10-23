import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";

type UnitSystem = "metric" | "imperial";
type Theme = "system" | "light" | "dark";
type Language = "en" | "de" | "es";

const MOCK_USER = {
  avatar:
    "https://images.unsplash.com/photo-1545996124-0501ebae84d0?q=80&w=600&auto=format&fit=crop",
  username: "Yamil",
  email: "yamil@example.com",
};

const Settings = () => {
  const { user } = useAuth();
  // Profile
  const [avatar, setAvatar] = useState(MOCK_USER.avatar);
  const [username, setUsername] = useState(MOCK_USER.username);
  const [email] = useState(MOCK_USER.email);
  const fileRef = useRef<HTMLInputElement | null>(null);

  console.log(avatar);

  // Preferences
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [theme, setTheme] = useState<Theme>("system");
  const [language, setLanguage] = useState<Language>("en");

  // Goals
  const [kcal, setKcal] = useState<number>(2200);
  const [p, setP] = useState<number>(160);
  const [c, setC] = useState<number>(220);
  const [f, setF] = useState<number>(70);

  // Notifications
  const [notifMeals, setNotifMeals] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifProduct, setNotifProduct] = useState(false);

  function fakeSave(section: string) {
    alert(`${section} saved (demo)`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6 text-black">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm opacity-70">Personaliza tu experiencia.</p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs opacity-70">
          Demo only
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Profile & Security */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile card */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold">Profile</h2>
            <p className="mb-4 text-sm opacity-70">
              Tu avatar y datos básicos.
            </p>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border">
                <img
                  src={user?.avatar}
                  alt={username}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://placehold.co/128x128?text=Avatar";
                  }}
                />
              </div>
              <div className="space-x-2">
                <button
                  className="rounded-lg border px-3 py-1.5 hover:bg-black/5"
                  onClick={() => fileRef.current?.click()}
                >
                  Change photo
                </button>
                <button
                  className="rounded-lg border px-3 py-1.5 hover:bg-black/5 mt-1"
                  onClick={() =>
                    setAvatar(
                      "https://images.unsplash.com/photo-1545996124-0501ebae84d0?q=80&w=600&auto=format&fit=crop"
                    )
                  }
                >
                  Reset
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setAvatar(url);
                    }
                  }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block">Username</span>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block">Email</span>
                <input
                  className="w-full rounded border px-3 py-2 opacity-70"
                  value={email}
                  disabled
                />
              </label>
            </div>

            <div className="mt-4">
              <button
                className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
                onClick={() => fakeSave("Profile")}
              >
                Save changes
              </button>
            </div>
          </section>

          {/* Security card */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold">Security</h2>
            <p className="mb-4 text-sm opacity-70">
              Cambia tu contraseña y revisa opciones sensibles.
            </p>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm opacity-70">Last updated: 3 months ago</p>
              </div>
              <Link
                to="/settings/security"
                className="rounded-lg border px-4 py-2 hover:bg-black/5"
              >
                Change password
              </Link>
            </div>
          </section>
        </div>

        {/* Right column: Preferences, Goals, Notifications */}
        <div className="space-y-6 lg:col-span-2">
          {/* Preferences */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold">Preferences</h2>
            <p className="mb-4 text-sm opacity-70">
              Idioma, tema y sistema de unidades.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="mb-1 block">Language</span>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.currentTarget.value as Language)
                  }
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block">Theme</span>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={theme}
                  onChange={(e) => setTheme(e.currentTarget.value as Theme)}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block">Units</span>
                <select
                  className="w-full rounded border px-3 py-2"
                  value={unitSystem}
                  onChange={(e) =>
                    setUnitSystem(e.currentTarget.value as UnitSystem)
                  }
                >
                  <option value="metric">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lb, in)</option>
                </select>
              </label>
            </div>

            <div className="mt-4">
              <button
                className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
                onClick={() => fakeSave("Preferences")}
              >
                Save preferences
              </button>
            </div>
          </section>

          {/* Macro goals */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Macro goals</h2>
              <span className="rounded-full border px-2 py-0.5 text-xs opacity-70">
                Preview
              </span>
            </div>
            <p className="mb-4 text-sm opacity-70">
              Define tus objetivos diarios (por día).
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <label className="block text-sm">
                <span className="mb-1 block">Calories (kcal)</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={kcal}
                  onChange={(e) => setKcal(parseInt(e.currentTarget.value))}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Protein (g)</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={p}
                  onChange={(e) => setP(parseInt(e.currentTarget.value))}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Carbs (g)</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={c}
                  onChange={(e) => setC(parseInt(e.currentTarget.value))}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block">Fat (g)</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded border px-3 py-2"
                  value={f}
                  onChange={(e) => setF(parseInt(e.currentTarget.value))}
                />
              </label>
            </div>

            <MacroPreview kcal={kcal} p={p} c={c} f={f} />

            <div className="mt-4">
              <button
                className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
                onClick={() => fakeSave("Macro goals")}
              >
                Save goals
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold">Notifications</h2>
            <p className="mb-4 text-sm opacity-70">
              Controla emails y resúmenes.
            </p>

            <div className="space-y-3">
              <ToggleRow
                label="Meal reminders"
                checked={notifMeals}
                onChange={setNotifMeals}
              />
              <ToggleRow
                label="Weekly summary"
                checked={notifWeekly}
                onChange={setNotifWeekly}
              />
              <ToggleRow
                label="Product updates"
                checked={notifProduct}
                onChange={setNotifProduct}
              />
            </div>

            <div className="mt-4">
              <button
                className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90"
                onClick={() => fakeSave("Notifications")}
              >
                Save preferences
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

/* ---------- helpers (dummy UI components) ---------- */

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border px-4 py-2">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`h-6 w-11 rounded-full transition ${
          checked ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`block h-5 w-5 translate-y-0.4 mx-[-1px] rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function MacroPreview({
  kcal,
  p,
  c,
  f,
}: {
  kcal: number;
  p: number;
  c: number;
  f: number;
}) {
  // cálculo básico de kcal estimadas por macros
  const kcalFromMacros = p * 4 + c * 4 + f * 9;
  const diff = kcal - kcalFromMacros;
  const diffLabel =
    diff === 0
      ? "Perfect match"
      : diff > 0
        ? `+${diff} kcal vs macros`
        : `${diff} kcal vs macros`;

  const pct = (val: number, total: number) =>
    total > 0 ? Math.round((val / total) * 100) : 0;

  const totalGrams = p + c + f;
  const pPct = pct(p, totalGrams);
  const cPct = pct(c, totalGrams);
  const fPct = pct(f, totalGrams);

  return (
    <div className="mt-4 rounded-xl border p-4 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="opacity-70">Macros → kcal estimate</span>
        <span className="rounded-full border px-2 py-0.5 text-xs">
          {kcalFromMacros} kcal
        </span>
      </div>

      <div className="mb-2 h-2 w-full overflow-hidden rounded bg-gray-200">
        <div
          className="h-full bg-emerald-500"
          style={{ width: `${pPct}%` }}
          title={`Protein ${pPct}%`}
        />
        <div
          className="h-full bg-amber-500"
          style={{ width: `${cPct}%` }}
          title={`Carbs ${cPct}%`}
        />
        <div
          className="h-full bg-rose-500"
          style={{ width: `${fPct}%` }}
          title={`Fat ${fPct}%`}
        />
      </div>

      <div className="flex flex-wrap gap-3 opacity-90">
        <span>Protein: {p}g</span>
        <span>Carbs: {c}g</span>
        <span>Fat: {f}g</span>
        <span className="ml-auto rounded-full border px-2 py-0.5 text-xs">
          {diffLabel}
        </span>
      </div>
    </div>
  );
}

export default Settings;
