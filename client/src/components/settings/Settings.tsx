/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/i18/i18";
import BillingSettingsCard from "./BillingSettingCard";

import { useAuth } from "@/context/UserContext";
import { updateAvatar, updateMe } from "@/services/usersService";

type UnitSystem = "metric" | "imperial";
type Theme = "system" | "light" | "dark";
type Language = "en" | "de" | "es";

const Settings = () => {
  const { user, refreshMe } = useAuth();

  const { t } = useTranslation("settings");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isSavingGoals, setIsSavingGoals] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

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
      setEmail(user.email || "");
      setAvatarPreview(user.avatar || "");

      setLanguage(user.preferences?.language || "en");
      setTheme(user.preferences?.theme || "system");
      setUnitSystem(user.preferences?.unitSystem || "metric");

      setKcal(user.macroGoals?.kcal ?? 2200);
      setP(user.macroGoals?.protein ?? 160);
      setC(user.macroGoals?.carbs ?? 220);
      setF(user.macroGoals?.fats ?? 70);

      setNotifMeals(user.notifications?.meals ?? true);
      setNotifWeekly(user.notifications?.weekly ?? true);
      setNotifProduct(user.notifications?.product ?? false);

      i18n.changeLanguage(user.preferences?.language || "en");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  //function handleResetAvatar() {
  //  setAvatarFile(null);
  //  setAvatarPreview(user?.avatar || "");
  //
  //  if (fileRef.current) {
  //    fileRef.current.value = "";
  //  }
  //}

  async function handleSaveProfile() {
    try {
      setIsSavingAvatar(true);

      if (avatarFile) {
        const updatedUser = await updateAvatar(avatarFile);

        setAvatarPreview(updatedUser.avatar || "");
        setAvatarFile(null);

        if (fileRef.current) {
          fileRef.current.value = "";
        }
      }

      if (username !== user?.username) {
        await updateMe({ username });
      }

      await refreshMe();

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Profile save error:", error.response?.data || error);

      toast.error(error.response?.data?.error || "Could not update profile");
    } finally {
      setIsSavingAvatar(false);
    }
  }

  async function handleSavePreferences() {
    try {
      setIsSavingPreferences(true);

      await updateMe({
        preferences: {
          language,
          theme,
          unitSystem,
        },
      });

      await i18n.changeLanguage(language);

      await refreshMe();

      toast.success("Preferences saved successfully");
    } catch (error: any) {
      console.error("Preferences save error:", error.response?.data || error);

      toast.error(error.response?.data?.error || "Could not save preferences");
    } finally {
      setIsSavingPreferences(false);
    }
  }

  async function handleSaveGoals() {
    try {
      setIsSavingGoals(true);

      await updateMe({
        macroGoals: {
          kcal,
          protein: p,
          carbs: c,
          fats: f,
        },
      });

      await refreshMe();

      toast.success("Macro goals saved successfully");
    } catch (error: any) {
      console.error("Macro goals save error:", error.response?.data || error);

      toast.error(error.response?.data?.error || "Could not save macro goals");
    } finally {
      setIsSavingGoals(false);
    }
  }

  async function handleSaveNotifications() {
    try {
      setIsSavingNotifications(true);

      await updateMe({
        notifications: {
          meals: notifMeals,
          weekly: notifWeekly,
          product: notifProduct,
        },
      });

      await refreshMe();

      toast.success("Notifications saved successfully");
    } catch (error: any) {
      console.error("Notifications save error:", error.response?.data || error);

      toast.error(
        error.response?.data?.error || "Could not save notifications",
      );
    } finally {
      setIsSavingNotifications(false);
    }
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px]" />

      <div className="relative z-10 mx-auto max-w-6xl p-4 sm:p-6 md:p-8 text-black">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-semibold">{t("title")}</h1>

            <p className="text-sm opacity-70">{t("subtitle")}</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <GlassCard>
              <h2 className="text-lg font-semibold">{t("profile")}</h2>

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
                    {t("changePhoto")}
                  </button>

                  {/*<button
                    type="button"
                    onClick={handleResetAvatar}
                    className="rounded-xl border px-3 py-1.5 bg-white/60 backdrop-blur"
                  >
                    {t("reset")}
                  </button>*/}
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
                {isSavingAvatar ? t("saving") : t("saveChanges")}
              </button>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold">{t("security")}</h2>

              <div className="flex justify-between items-center mt-4 border p-4 rounded-xl bg-white/60 backdrop-blur">
                <div>
                  <p>{t("password")}</p>

                  <p className="text-sm opacity-70">{t("lastUpdated")}</p>
                </div>

                <Link
                  to="/settings/security"
                  className="border px-4 py-2 rounded-xl bg-white/60"
                >
                  {t("change")}
                </Link>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <BillingSettingsCard />
            <GlassCard>
              <h2 className="text-lg font-semibold">{t("preferences")}</h2>

              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="rounded-xl border px-3 py-2 bg-white/60"
                >
                  <option value="en">{t("english")}</option>

                  <option value="de">{t("german")}</option>

                  <option value="es">{t("spanish")}</option>
                </select>

                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="rounded-xl border px-3 py-2 bg-white/60"
                >
                  <option value="system">{t("system")}</option>

                  <option value="light">{t("light")}</option>

                  <option value="dark">{t("dark")}</option>
                </select>

                <select
                  value={unitSystem}
                  onChange={(e) => setUnitSystem(e.target.value as UnitSystem)}
                  className="rounded-xl border px-3 py-2 bg-white/60"
                >
                  <option value="metric">{t("metric")}</option>

                  <option value="imperial">{t("imperial")}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSavingPreferences}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl disabled:opacity-60"
              >
                {isSavingPreferences ? t("saving") : t("savePreferences")}
              </button>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold">{t("macroGoals")}</h2>

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
                onClick={handleSaveGoals}
                disabled={isSavingGoals}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl disabled:opacity-60"
              >
                {isSavingGoals ? t("saving") : t("saveGoals")}
              </button>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-semibold">{t("notifications")}</h2>

              <div className="space-y-3 mt-4">
                <ToggleRow
                  label={t("mealReminders")}
                  checked={notifMeals}
                  onChange={setNotifMeals}
                />

                <ToggleRow
                  label={t("weeklySummary")}
                  checked={notifWeekly}
                  onChange={setNotifWeekly}
                />

                <ToggleRow
                  label={t("productUpdates")}
                  checked={notifProduct}
                  onChange={setNotifProduct}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={isSavingNotifications}
                className="mt-4 w-full bg-lime-400 py-2 rounded-xl disabled:opacity-60"
              >
                {isSavingNotifications ? t("saving") : t("saveNotifications")}
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
