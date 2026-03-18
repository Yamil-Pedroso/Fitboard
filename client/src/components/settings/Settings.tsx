/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";
import assets from "@/assets";

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

  const [avatar, setAvatar] = useState(MOCK_USER.avatar);
  const [username, setUsername] = useState(MOCK_USER.username);
  const [email] = useState(MOCK_USER.email);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [theme, setTheme] = useState<Theme>("system");
  const [language, setLanguage] = useState<Language>("en");

  const [kcal, setKcal] = useState<number>(2200);
  const [p, setP] = useState<number>(160);
  const [c, setC] = useState<number>(220);
  const [f, setF] = useState<number>(70);

  const [notifMeals, setNotifMeals] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifProduct, setNotifProduct] = useState(false);

  function fakeSave(section: string) {
    alert(`${section} saved (demo)`);
  }

  return (
    <div className="relative pt-20">
      {/* BG */}

      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px]" />

      <div className="relative z-10 mx-auto max-w-6xl p-4 sm:p-6 md:p-8 text-black">
        {/* HEADER */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm opacity-70">Personaliza tu experiencia.</p>
          </div>
          <span className="rounded-full border px-3 py-1 text-xs bg-white/60 backdrop-blur">
            Demo only
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6">
            <GlassCard>
              <h2 className="text-lg font-semibold">Profile</h2>

              <div className="flex items-center gap-4 mt-4">
                <div className="h-16 w-16 rounded-full overflow-hidden border">
                  <img
                    src={user?.avatar}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl border px-3 py-1.5 bg-white/60 backdrop-blur"
                  >
                    Change photo
                  </button>
                  <button
                    onClick={() => setAvatar(MOCK_USER.avatar)}
                    className="rounded-xl border px-3 py-1.5 bg-white/60 backdrop-blur"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) setAvatar(URL.createObjectURL(file));
                }}
              />

              <div className="mt-4 space-y-3">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 bg-white/60 backdrop-blur"
                />

                <input
                  value={email}
                  disabled
                  className="w-full rounded-xl border px-3 py-2 bg-white/40"
                />
              </div>

              <button
                onClick={() => fakeSave("Profile")}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl hover:bg-lime-300"
              >
                Save changes
              </button>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold">Security</h2>

              <div className="flex justify-between items-center mt-4 border p-4 rounded-xl bg-white/60 backdrop-blur">
                <div>
                  <p>Password</p>
                  <p className="text-sm opacity-70">
                    Last updated: 3 months ago
                  </p>
                </div>

                <Link
                  to="/settings/security"
                  className="border px-4 py-2 rounded-xl bg-white/60"
                >
                  Change
                </Link>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <h2 className="text-lg font-semibold">Preferences</h2>

              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="rounded-xl border px-3 py-2 bg-white/60"
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="es">Español</option>
                </select>

                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="rounded-xl border px-3 py-2 bg-white/60"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>

                <select
                  value={unitSystem}
                  onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
                  className="rounded-xl border px-3 py-2 bg-white/60"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
              </div>

              <button
                onClick={() => fakeSave("Preferences")}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl"
              >
                Save preferences
              </button>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold">Macro goals</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <input
                  type="number"
                  value={kcal}
                  onChange={(e) => setKcal(+e.target.value)}
                  className="input"
                />
                <input
                  type="number"
                  value={p}
                  onChange={(e) => setP(+e.target.value)}
                  className="input"
                />
                <input
                  type="number"
                  value={c}
                  onChange={(e) => setC(+e.target.value)}
                  className="input"
                />
                <input
                  type="number"
                  value={f}
                  onChange={(e) => setF(+e.target.value)}
                  className="input"
                />
              </div>

              <MacroPreview kcal={kcal} p={p} c={c} f={f} />

              <button
                onClick={() => fakeSave("Macro goals")}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl"
              >
                Save goals
              </button>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold">Notifications</h2>

              <div className="space-y-3 mt-4">
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

              <button
                onClick={() => fakeSave("Notifications")}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl"
              >
                Save preferences
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

function GlassCard({ children }: any) {
  return (
    <div className="rounded-2xl border bg-white/70 backdrop-blur-xl p-5 shadow-sm">
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: any) {
  return (
    <div className="flex justify-between items-center border rounded-xl p-3 bg-white/60">
      <span>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full ${
          checked ? "bg-lime-400" : "bg-gray-300"
        }`}
      />
    </div>
  );
}

function MacroPreview({ kcal, p, c, f }: any) {
  const total = p + c + f;
  return (
    <div className="mt-4 text-sm">
      Total macros: {total}g • {kcal} kcal
    </div>
  );
}

export default Settings;
