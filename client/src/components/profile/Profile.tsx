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
  avatar:
    "https://images.unsplash.com/photo-1545996124-0501ebae84d0?q=80&w=600&auto=format&fit=crop",
  username: "Yamil",
  email: "yamil@example.com",
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
  {
    id: "r1",
    name: "Chicken Bowl",
    servings: 2,
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1200&auto=format&fit=crop",
  },
  { id: "r2", name: "Salmon Power Plate", servings: 2 },
  {
    id: "r3",
    name: "High-Protein Oats",
    servings: 1,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200&auto=format&fit=crop",
  },
];

const MOCK_BADGES = [
  { label: "First week logged", icon: "🏅" },
  { label: "Protein streak 7d", icon: "🥇" },
  { label: "Meal planner", icon: "📅" },
];

const Profile = () => {
  const { meals, page, total, isLoading } = useMeals();
  const { user } = useAuth();
  const navigate = useNavigate();
  const kcalFromMacros = useMemo(
    () => MOCK_GOAL.p * 4 + MOCK_GOAL.c * 4 + MOCK_GOAL.f * 9,
    []
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
    <div className="mx-auto w-full max-w-6xl p-6 text-black">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border">
            <img
              src={user?.avatar || MOCK_PROFILE.avatar}
              alt={MOCK_PROFILE.username}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://placehold.co/128x128?text=Avatar";
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{MOCK_PROFILE.username}</h1>
            <p className="text-sm opacity-70">{MOCK_PROFILE.email}</p>
            <p className="text-xs opacity-60">
              Member since {MOCK_PROFILE.memberSince}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to="/settings"
            className="rounded-lg border px-4 py-2 hover:bg-black/5"
          >
            Edit profile
          </Link>
          <Link
            to="/settings/security"
            className="rounded-lg border px-4 py-2 hover:bg-black/5"
          >
            Security
          </Link>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">Bio</h2>
        <p className="opacity-80">{MOCK_PROFILE.bio}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Week summary */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">This week</h2>
            <Link to="/" className="text-sm underline">
              View dashboard
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MOCK_WEEK_STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Goal preview */}
          <div className="mt-5 rounded-xl border p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Macro goals</h3>
              <span className="rounded-full border px-2 py-0.5 text-xs opacity-70">
                {diffLabel}
              </span>
            </div>

            <div className="mb-3 h-2 w-full overflow-hidden rounded bg-gray-200">
              {/* barras simples de proporciones */}
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${pct(MOCK_GOAL.p, MOCK_GOAL.p + MOCK_GOAL.c + MOCK_GOAL.f)}%`,
                }}
                title="Protein"
              />
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${pct(MOCK_GOAL.c, MOCK_GOAL.p + MOCK_GOAL.c + MOCK_GOAL.f)}%`,
                }}
                title="Carbs"
              />
              <div
                className="h-full bg-rose-500"
                style={{
                  width: `${pct(MOCK_GOAL.f, MOCK_GOAL.p + MOCK_GOAL.c + MOCK_GOAL.f)}%`,
                }}
                title="Fat"
              />
            </div>

            <div className="flex flex-wrap gap-3 text-sm opacity-90">
              <span>Calories: {MOCK_GOAL.kcal} kcal</span>
              <span>Protein: {MOCK_GOAL.p} g</span>
              <span>Carbs: {MOCK_GOAL.c} g</span>
              <span>Fat: {MOCK_GOAL.f} g</span>
            </div>
          </div>
        </section>

        <ProfileProgressGlance />
        <ProfileReferencePhotos />

        {/* Badges */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Badges</h2>
            <span className="rounded-full border px-2 py-0.5 text-xs opacity-70">
              3 unlocked
            </span>
          </div>

          <ul className="space-y-3">
            {MOCK_BADGES.map((b, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-sm">{b.label}</span>
                </div>
                <span className="text-xs opacity-60">View</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent meals */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent meals</h2>
            <Link to="/meals" className="text-sm underline">
              See all
            </Link>
          </div>

          {isLoading ? (
            <p>Loading meals...</p>
          ) : meals.length === 0 ? (
            <EmptyState
              title="No meals logged yet"
              cta="Log your first meal"
              to="/meals/create"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Slot</th>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Kcal</th>
                    <th className="p-2 text-left">Protein</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meals.map((m) => (
                    <tr key={m._id} className="border-t">
                      <td className="p-2">{m.date}</td>
                      <td className="p-2 capitalize">{m.slot}</td>
                      <td className="p-2">{m.slot}</td>
                      <td className="p-2">{m.customItem?.name}</td>
                      <td className="p-2">
                        {m.customItem?.macrosPerBasis.kcal}
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleMealClick(m._id)}
                          className="underline"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Top recipes */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top recipes</h2>
            <Link to="/recipes" className="text-sm underline">
              See all
            </Link>
          </div>

          {MOCK_TOP_RECIPES.length === 0 ? (
            <EmptyState
              title="No recipes yet"
              cta="Create recipe"
              to="/recipes/create"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {MOCK_TOP_RECIPES.map((r) => (
                <article
                  key={r.id}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <img
                      src={r.image ?? FALLBACK_IMG}
                      alt={r.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          FALLBACK_IMG;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="line-clamp-1 font-semibold">{r.name}</h3>
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs">
                        {r.servings} servings
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link to="/recipes" className="text-sm underline">
                        Open
                      </Link>
                      <span className="text-xs opacity-60">Favorite</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/* ---------- helpers ---------- */

function StatCard({ label, value, unit, hint }: Stat) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {value}
        {unit ? (
          <span className="ml-1 text-sm font-normal opacity-70">{unit}</span>
        ) : null}
      </p>
      {hint ? <p className="mt-1 text-xs opacity-60">{hint}</p> : null}
    </div>
  );
}

function EmptyState({
  title,
  cta,
  to,
}: {
  title: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="rounded-xl border p-8 text-center">
      <p className="mb-2 text-lg font-medium">{title}</p>
      <Link
        to={to as any}
        className="inline-flex items-center justify-center rounded bg-black px-4 py-2 text-white hover:opacity-90"
      >
        {cta}
      </Link>
    </div>
  );
}

function pct(val: number, total: number) {
  if (!total) return 0;
  return Math.round((val / total) * 100);
}

export default Profile;
