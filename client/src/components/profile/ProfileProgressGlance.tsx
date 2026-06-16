// ProfileProgressGlance.tsx
import { Link } from "@tanstack/react-router";
import { useProgress } from "@/lib/hooks/useProgress";

const ProfileProgressGlance = () => {
  const { items, isLoading } = useProgress({
    page: 1,
    limit: 1,
    sort: "-date",
  });
  const latest = items?.[0];

  const date = latest?.date ?? "—";
  const weight =
    latest?.weight_kg != null ? `${latest.weight_kg.toFixed(1)} kg` : "—";
  const waist =
    latest?.waist_cm != null ? `${latest.waist_cm.toFixed(0)} cm` : "—";
  const bodyFat =
    latest?.body?.bodyFatPct != null
      ? `${latest.body.bodyFatPct.toFixed(1)}%`
      : "—";

  return (
    <section className="rounded-2xl border app-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Progress glance</h2>
        <Link to="/progress" className="text-sm underline">
          Open progress
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm opacity-70">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Weight" value={weight} />
            <Metric label="Waist" value={waist} />
            <Metric label="Body fat" value={bodyFat} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs opacity-70">Last update: {date}</span>
            <Link
              to="/"
              className="rounded-lg border px-3 py-1.5 text-sm app-secondary-action"
            >
              + Add entry
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border app-border p-3 text-center">
      <p className="text-[11px] uppercase tracking-wide opacity-60">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

export default ProfileProgressGlance;
