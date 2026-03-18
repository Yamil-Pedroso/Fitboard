/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate } from "@tanstack/react-router";
import { Route as MealDetailsRoute } from "@/routes/meals/details/$mealId";
import { useMemo } from "react";
import { useAuth } from "@/context/UserContext";
import { useMeals } from "@/lib/hooks/useMeals";
import ProfileProgressGlance from "./ProfileProgressGlance";
import ProfileReferencePhotos from "./ProfileReferencePhotos";

type Stat = { label: string; value: number; unit?: string; hint?: string };
type Recipe = { id: string; name: string; servings: number; image?: string };

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop";

const MOCK_PROFILE = {
  memberSince: "2024-05-10",
  bio: "Lifting, coding, and chasing protein goals. 🏋️‍♂️💻",
};

const MOCK_WEEK_STATS: Stat[] = [
  { label: "Meals logged", value: 18, hint: "Goal: 21" },
  { label: "Avg kcal/day", value: 2175, unit: "kcal" },
  { label: "Protein/day", value: 162, unit: "g", hint: "Target: 160g" },
  { label: "Water/day", value: 2.3, unit: "L" },
];

const MOCK_GOAL = { kcal: 2200, p: 160, c: 220, f: 70 };

const MOCK_TOP_RECIPES: Recipe[] = [
  { id: "r1", name: "Chicken Bowl", servings: 2 },
  { id: "r2", name: "Salmon Power Plate", servings: 2 },
  { id: "r3", name: "High-Protein Oats", servings: 1 },
];

const MOCK_BADGES = [
  { label: "First week logged", icon: "🏅" },
  { label: "Protein streak 7d", icon: "🥇" },
  { label: "Meal planner", icon: "📅" },
];

const Profile = () => {
  const { meals, total, isLoading } = useMeals();
  const { user } = useAuth();
  const navigate = useNavigate();

  const kcalFromMacros = useMemo(
    () => MOCK_GOAL.p * 4 + MOCK_GOAL.c * 4 + MOCK_GOAL.f * 9,
    [],
  );

  const diff = MOCK_GOAL.kcal - kcalFromMacros;

  const diffLabel =
    diff === 0
      ? "Perfect match"
      : diff > 0
        ? `+${diff} kcal vs macros`
        : `${diff} kcal vs macros`;

  const handleMealClick = (mealId: string) => {
    navigate({ to: MealDetailsRoute.to, params: { mealId } });
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6 pt-24 text-black">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-neutral-200 shadow-sm">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">{user?.username}</h1>
            <p className="text-sm text-neutral-500">{user?.email}</p>
            <p className="text-xs text-neutral-400">
              Member since {MOCK_PROFILE.memberSince}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/settings"
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Edit profile
          </Link>

          <Link
            to="/settings/security"
            className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-medium text-black hover:bg-lime-300"
          >
            Security
          </Link>
        </div>
      </div>

      {/* BIO */}
      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">Bio</h2>
        <p className="text-neutral-600">{MOCK_PROFILE.bio}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* WEEK */}
        <section className="rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-semibold">This week</h2>
            <Link to="/" className="text-sm text-lime-600 hover:underline">
              View dashboard
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MOCK_WEEK_STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-neutral-200 p-4">
            <div className="mb-2 flex justify-between">
              <h3 className="font-medium">Macro goals</h3>
              <span className="text-xs text-neutral-500">{diffLabel}</span>
            </div>

            <div className="mb-3 h-2 w-full overflow-hidden rounded bg-neutral-200">
              <div
                className="h-full bg-lime-400"
                style={{ width: `${pct(MOCK_GOAL.p, 450)}%` }}
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${pct(MOCK_GOAL.c, 450)}%` }}
              />
              <div
                className="h-full bg-rose-400"
                style={{ width: `${pct(MOCK_GOAL.f, 450)}%` }}
              />
            </div>
          </div>
        </section>

        <ProfileProgressGlance />
        <ProfileReferencePhotos />

        {/* BADGES */}
        <section className="rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Badges</h2>

          <ul className="space-y-3">
            {MOCK_BADGES.map((b, i) => (
              <li
                key={i}
                className="flex justify-between rounded-xl border border-neutral-200 px-3 py-2"
              >
                <span>
                  {b.icon} {b.label}
                </span>
                <span className="text-xs text-neutral-400">View</span>
              </li>
            ))}
          </ul>
        </section>

        {/* MEALS */}
        <section className="rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-semibold">Recent meals</h2>
            <Link to="/meals" className="text-sm text-lime-600 hover:underline">
              See all
            </Link>
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : meals.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {meals.map((m) => (
                  <tr key={m._id} className="border-t">
                    <td className="p-2">{m.date}</td>
                    <td className="p-2">{m.slot}</td>
                    <td className="p-2">{m.customItem?.name}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleMealClick(m._id)}
                        className="text-lime-600 hover:underline"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

function StatCard({ label, value, unit }: Stat) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/80 backdrop-blur p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold">
        {value} {unit}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-neutral-200 p-8 text-center">
      <p className="mb-2 text-lg font-medium">No meals logged yet</p>
      <Link
        to="/meals/create"
        className="rounded-xl bg-lime-400 px-4 py-2 text-black hover:bg-lime-300"
      >
        Log your first meal
      </Link>
    </div>
  );
}

function pct(val: number, total: number) {
  return Math.round((val / total) * 100);
}

export default Profile;
