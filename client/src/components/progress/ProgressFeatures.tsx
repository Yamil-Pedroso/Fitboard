/* eslint-disable @typescript-eslint/no-explicit-any */
import assets from "@/assets";
import ProteinGaugeCard from "@/components/dummy-components/ProteinGaugeCard";
import { useProgress } from "@/lib/hooks/useProgress";

const ProgressFeatures = () => {
  // Trae los últimos registros (pide varios para poder calcular delta si quieres luego)
  const { items, isLoading } = useProgress({
    page: 1,
    limit: 7,
    sort: "-date",
  } as any);

  const latest = items?.[0];
  const prev = items?.[1];

  // Header date
  const dateStr = latest?.date ?? new Date().toISOString().slice(0, 10);

  // Stats
  const weightKg = latest?.weight_kg ?? null;
  const waistCm = latest?.waist_cm ?? null;
  const bodyFat = latest?.body?.bodyFatPct ?? null;

  // Si tu backend guarda unitSystem, puedes formatear en lbs si es "imperial"
  const unitSystem = latest?.unitSystem ?? "metric";
  const weightVal =
    weightKg == null
      ? "-"
      : unitSystem === "imperial"
        ? (weightKg * 2.20462).toFixed(1)
        : weightKg.toFixed(1);
  const weightUnit = unitSystem === "imperial" ? "lb" : "kg";

  // (Opcional) delta vs entrada anterior, solo texto entre paréntesis
  const deltaKg =
    weightKg != null && prev?.weight_kg != null
      ? weightKg - prev.weight_kg
      : null;
  const weightWithDelta =
    deltaKg == null
      ? `${weightVal}`
      : `${weightVal} (${deltaKg > 0 ? "+" : ""}${
          unitSystem === "imperial"
            ? (deltaKg * 2.20462).toFixed(1)
            : deltaKg.toFixed(1)
        })`;

  const waistVal = waistCm == null ? "-" : waistCm.toFixed(0);
  const bodyFatVal = bodyFat == null ? "-" : bodyFat.toFixed(1);

  // Notas
  const notes =
    latest?.notes ??
    "No notes yet. Add a quick reflection to track your context over time.";

  // Fotos (usa las del backend; si no hay, usa fallbacks)
  const photo1 = latest?.photos?.[0]?.url ?? assets.progress2;
  const photo2 = latest?.photos?.[1]?.url ?? assets.progress3;

  // Tags (si existen)
  const tags = latest?.tags ?? [];

  return (
    <div className="relative">
      {/* Fondo fijo full viewport */}
      <img
        src={assets.progress1}
        alt="Progress Feature"
        className="fixed inset-0 h-[100svh] w-screen object-cover object-center"
      />

      {/* Overlay centrado con grid de 2 cards (gap ~1rem) */}
      <div className="fixed inset-0 z-10 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full flex items-center gap-6 ml-[14rem]">
          {/* Card: Progress snapshot (misma UI, datos reales) */}
          <div className="relative w-[45rem]">
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-black/60 via-black/20 to-transparent opacity-80" />
            <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl text-white">
              <div className="pointer-events-none absolute -top-6 right-10 h-16 w-16 rounded-full bg-white/30 blur-2xl" />

              <div className="p-5 sm:p-6 md:p-8">
                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/80 to-cyan-400/80 shadow-lg ring-1 ring-white/30 sm:h-12 sm:w-12">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="drop-shadow-sm sm:w-[22px] sm:h-[22px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15V8a2 2 0 0 0-2-2h-3" />
                      <path d="M3 15V8a2 2 0 0 1 2-2h3" />
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M8 11v10M16 11v10" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                      Progress snapshot
                    </h2>
                    <p className="text-xs text-white/70 sm:text-sm">
                      {dateStr}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat
                    label={isLoading ? "Weight (loading…)" : "Weight"}
                    value={weightWithDelta}
                    unit={weightKg == null ? undefined : weightUnit}
                  />
                  <Stat
                    label={isLoading ? "Waist (loading…)" : "Waist"}
                    value={waistVal}
                    unit={waistCm == null ? undefined : "cm"}
                  />
                  <Stat
                    label="Body fat"
                    value={bodyFatVal}
                    unit={bodyFat == null ? undefined : "%"}
                  />
                  <Stat
                    label="Steps"
                    value={
                      latest?.activity?.steps != null
                        ? latest.activity.steps.toString()
                        : "—"
                    }
                  />
                </div>

                {/* Barras (deja tu UI original; si quieres, calcula % simple con un target fijo) */}
                <div className="mt-6 space-y-4">
                  <Bar
                    title="Weight goal"
                    hint="→ 75 kg"
                    percent={
                      weightKg != null
                        ? Math.max(
                            0,
                            Math.min(100, Math.round((75 / weightKg) * 100))
                          )
                        : 0
                    }
                  />
                  <Bar
                    title="Waist goal"
                    hint="→ 80 cm"
                    percent={
                      waistCm != null
                        ? Math.max(
                            0,
                            Math.min(100, Math.round((80 / waistCm) * 100))
                          )
                        : 0
                    }
                  />
                </div>

                {/* Notas */}
                <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-3 sm:p-4">
                  <p className="text-sm leading-relaxed text-white/90">
                    {notes}
                  </p>
                </div>

                {/* Tags (si hay) */}
                {tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/90"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Fotos desde backend */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <PhotoPlaceholder src={photo1} />
                  <PhotoPlaceholder src={photo2} />
                </div>

                {/* Footer (sin cambios) */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-white/15 px-3 py-2 text-sm font-medium hover:bg-white/20 transition border border-white/20"
                  >
                    + Add entry
                  </button>
                  <button
                    type="button"
                    className="rounded-XL bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15 transition border border-white/10"
                  >
                    Upload photo
                  </button>
                  <span className="ml-auto text-xs text-white/60">
                    {isLoading ? "Loading…" : "From your latest progress"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NO tocar este componente */}
          <div className="w-full">
            <ProteinGaugeCard />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Subcomponentes originales (sin cambios de estilo) ---------- */

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-2.5 text-center sm:p-3">
      <div className="text-[10px] uppercase tracking-wide text-white/70 sm:text-[11px]">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold sm:text-lg">
        {value}{" "}
        {unit && (
          <span className="text-white/70 text-xs sm:text-sm">{unit}</span>
        )}
      </div>
    </div>
  );
}

function Bar({
  title,
  hint,
  percent,
}: {
  title: string;
  hint?: string;
  percent: number; // 0..100
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium">{title}</span>
        {hint && <span className="text-xs text-white/70">{hint}</span>}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-300/90 to-cyan-300/90"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function PhotoPlaceholder({ src }: { src: string }) {
  return (
    <div className="group relative grid h-24 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/5 sm:h-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)] opacity-60" />
      <img src={src} alt="Progress" className="h-full w-full object-cover" />
    </div>
  );
}

export default ProgressFeatures;
