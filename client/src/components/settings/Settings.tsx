/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";
import { updateAvatar } from "@/services/usersService";

type UnitSystem = "metric" | "imperial";
type Theme = "system" | "light" | "dark";
type Language = "en" | "de" | "es";

const Settings = () => {
  const { user, refreshMe } = useAuth();

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState(user?.username || "");
  const [email] = useState(user?.email || "");

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

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

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function fakeSave(section: string) {
    alert(`${section} saved (demo)`);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleResetAvatar() {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || "");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  async function handleSaveProfile() {
    if (!avatarFile) {
      alert("Please select an image first");
      return;
    }

    try {
      setIsSavingAvatar(true);

      const updatedUser = await updateAvatar(avatarFile);

      await refreshMe();

      setAvatarPreview(updatedUser.avatar || "");
      setAvatarFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      alert("Profile photo updated successfully");
    } catch (error: any) {
      console.error("Avatar upload error:", error.response?.data || error);

      alert(error.response?.data?.error || "Could not update profile photo");
    } finally {
      setIsSavingAvatar(false);
    }
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px]" />

      <div className="relative z-10 mx-auto max-w-6xl p-4 sm:p-6 md:p-8 text-black">
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
          <div className="space-y-6">
            <GlassCard>
              <h2 className="text-lg font-semibold">Profile</h2>

              <div className="flex items-center gap-4 mt-4">
                <div className="h-16 w-16 rounded-full overflow-hidden border bg-white">
                  <img
                    src={avatarPreview || user?.avatar}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl border px-3 py-1.5 bg-white/60 backdrop-blur"
                  >
                    Change photo
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className="rounded-xl border px-3 py-1.5 bg-white/60 backdrop-blur"
                  >
                    Reset
                  </button>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

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
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingAvatar}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl hover:bg-lime-300 disabled:opacity-60"
              >
                {isSavingAvatar ? "Saving..." : "Save changes"}
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
                type="button"
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
                type="button"
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
                type="button"
                onClick={() => fakeSave("Notifications")}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl"
              >
                Save notifications
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
        type="button"
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
