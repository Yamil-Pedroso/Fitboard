/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import assets from "@/assets";
import { useProgress } from "@/lib/hooks/useProgress";
import {
  useUpsertPosedPhotos,
  useUploadReferencePhotos,
} from "@/lib/hooks/useProgress";
import { RiProgress5Fill } from "react-icons/ri";
import { FaPerson } from "react-icons/fa6";
import { IoMdPhotos } from "react-icons/io";
import { motion, Variants } from "framer-motion";

type Pose = "front" | "side" | "back";
type RefWhich = "start" | "compare";
type ActiveSlot =
  | { kind: "pose"; pose: Pose }
  | { kind: "ref"; which: RefWhich }
  | null;

// Motion variants
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
} as Variants;
const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", duration: 0.6, bounce: 0.25 },
  },
} as Variants;

const ProgressFeatures = () => {
  // fetch latest entries
  const { items, isLoading } = useProgress({
    page: 1,
    limit: 7,
    sort: "-date",
  } as any);
  const latest = items?.[0];
  const prev = items?.[1];

  // mutations
  const { mutate: upsertPosed, isPending: posedUploading } =
    useUpsertPosedPhotos();
  const { mutate: uploadRefs, isPending: refsUploading } =
    useUploadReferencePhotos();

  // derive posed URLs by pose name
  const frontUrl =
    latest?.photos?.find((p) => p.pose === "front")?.url ?? assets.progress2;
  const sideUrl =
    latest?.photos?.find((p) => p.pose === "side")?.url ?? assets.progress3;
  const backUrl =
    latest?.photos?.find((p) => p.pose === "back")?.url ?? assets.progress1;

  // local preview state
  const [photoFront, setPhotoFront] = useState<string>(frontUrl);
  const [photoSide, setPhotoSide] = useState<string>(sideUrl);
  const [photoBack, setPhotoBack] = useState<string>(backUrl);

  const startUrl = latest?.startPhoto?.url ?? "";
  const compareUrl = latest?.comparePhoto?.url ?? "";
  const [photoStart, setPhotoStart] = useState<string>(
    startUrl || assets.progress2
  );
  const [photoCompare, setPhotoCompare] = useState<string>(
    compareUrl || assets.progress3
  );

  useEffect(() => {
    setPhotoFront(
      latest?.photos?.find((p) => p.pose === "front")?.url ?? assets.progress2
    );
    setPhotoSide(
      latest?.photos?.find((p) => p.pose === "side")?.url ?? assets.progress3
    );
    setPhotoBack(
      latest?.photos?.find((p) => p.pose === "back")?.url ?? assets.progress1
    );
    setPhotoStart(latest?.startPhoto?.url ?? assets.progress2);
    setPhotoCompare(latest?.comparePhoto?.url ?? assets.progress3);
  }, [latest]);

  // single hidden input and active slot
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>(null);
  const isUploading = posedUploading || refsUploading;

  const openPickerPose = (pose: Pose) => {
    setActiveSlot({ kind: "pose", pose });
    fileInputRef.current?.click();
  };
  const openPickerRef = (which: RefWhich) => {
    setActiveSlot({ kind: "ref", which });
    fileInputRef.current?.click();
  };

  // upload dispatcher
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !latest?._id) return;

    if (activeSlot?.kind === "pose") {
      const files: Partial<Record<Pose, File>> = { [activeSlot.pose]: file };
      upsertPosed(
        { id: latest._id, files },
        {
          onSuccess: () => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              if (activeSlot.pose === "front") setPhotoFront(dataUrl);
              if (activeSlot.pose === "side") setPhotoSide(dataUrl);
              if (activeSlot.pose === "back") setPhotoBack(dataUrl);
            };
            reader.readAsDataURL(file);
          },
        }
      );
    } else if (activeSlot?.kind === "ref") {
      const payload: { id: string; start?: File; compare?: File } = {
        id: latest._id,
      };
      if (activeSlot.which === "start") payload.start = file;
      if (activeSlot.which === "compare") payload.compare = file;

      uploadRefs(payload, {
        onSuccess: () => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            if (activeSlot.which === "start") setPhotoStart(dataUrl);
            if (activeSlot.which === "compare") setPhotoCompare(dataUrl);
          };
          reader.readAsDataURL(file);
        },
      });
    }

    setActiveSlot(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // computed snapshot values
  const dateStr = latest?.date ?? new Date().toISOString().slice(0, 10);
  const weightKg = latest?.weight_kg ?? null;
  const waistCm = latest?.waist_cm ?? null;
  const bodyFat = latest?.body?.bodyFatPct ?? null;

  const unitSystem = latest?.unitSystem ?? "metric";
  const weightVal =
    weightKg == null
      ? "-"
      : unitSystem === "imperial"
        ? (weightKg * 2.20462).toFixed(1)
        : weightKg.toFixed(1);
  const weightUnit = unitSystem === "imperial" ? "lb" : "kg";
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
  const notes =
    latest?.notes ??
    "No notes yet. Add a quick reflection to track your context over time.";
  const tags = latest?.tags ?? [];

  // --- Hover video control for the FRONT tile ---
  const frontVideoRef = useRef<HTMLVideoElement | null>(null);
  const handleFrontEnter = () => {
    const v = frontVideoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const handleFrontLeave = () => {
    const v = frontVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  const sideVideoRef = useRef<HTMLVideoElement | null>(null);
  const handleSideEnter = () => {
    const v = sideVideoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const handleSideLeave = () => {
    const v = sideVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  const backVideoRef = useRef<HTMLVideoElement | null>(null);
  const handleBackEnter = () => {
    const v = backVideoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const handleBackLeave = () => {
    const v = backVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  const startVideoRef = useRef<HTMLVideoElement | null>(null);
  const handleStartEnter = () => {
    const v = startVideoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const handleStartLeave = () => {
    const v = startVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <div className="relative">
      {/* full-screen background */}
      <img
        src={assets.progress1}
        alt="Progress Feature"
        className="fixed inset-0 h-[100svh] w-screen object-cover object-center"
      />

      {/* centered overlay; scrollable if the viewport is short */}
      <div className="relative z-10 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8">
        <motion.div
          className="w-full mt-2 flex flex-col items-center gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* 1) Snapshot Card */}
          <motion.div variants={item} className="w-full max-w-[50rem]">
            <CardShell>
              <ProgressSnapshot
                dateStr={dateStr}
                isLoading={isLoading}
                weightWithDelta={weightWithDelta}
                weightUnit={weightKg == null ? undefined : weightUnit}
                waistVal={waistVal}
                bodyFatVal={bodyFatVal}
                steps={
                  latest?.activity?.steps != null
                    ? latest.activity.steps.toString()
                    : "—"
                }
                weightKg={weightKg}
                waistCm={waistCm}
                notes={notes}
                tags={tags}
              />
            </CardShell>
          </motion.div>

          {/* 2) Two cards: smaller check-in & reference */}
          <motion.div
            variants={item}
            className="flex w-full max-w-[50rem] flex-col lg:flex-row gap-6"
          >
            {/* Posed photos: front/side/back (small tiles) */}
            <motion.div variants={item} className="lg:flex-1">
              <CardShell className="lg:flex-1">
                <SectionHeader
                  title="Check-in photos"
                  subtitle="Front • Side • Back"
                  icon={
                    <FaPerson className="text-white drop-shadow-sm text-[22px] inline-block " />
                  }
                />
                <motion.div
                  className="mt-4 flex flex-wrap gap-3"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  {/* FRONT tile with hover video overlay */}
                  <motion.div
                    variants={item}
                    className="basis-full sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(33.333%-0.5rem)]"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl group"
                      onMouseEnter={handleFrontEnter}
                      onMouseLeave={handleFrontLeave}
                    >
                      <PhotoTile
                        src={photoFront}
                        badge="Front"
                        disabled={isUploading}
                        onClick={() => openPickerPose("front")}
                        size="sm"
                      />

                      {/* overlay de video */}
                      <video
                        ref={frontVideoRef}
                        src={assets.vOne}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                 rounded-2xl z-[2]"
                        muted
                        loop
                        playsInline
                      />
                    </div>
                  </motion.div>

                  {/* SIDE */}
                  <motion.div
                    variants={item}
                    className="basis-full sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(33.333%-0.5rem)]"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl group"
                      onMouseEnter={handleSideEnter}
                      onMouseLeave={handleSideLeave}
                    >
                      <PhotoTile
                        src={photoSide}
                        badge="Side"
                        disabled={isUploading}
                        onClick={() => openPickerPose("side")}
                        size="sm"
                      />

                      {/* overlay de video */}
                      <video
                        ref={sideVideoRef}
                        src={assets.vThree}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                 rounded-2xl z-[2]"
                        muted
                        loop
                        playsInline
                      />
                    </div>
                  </motion.div>

                  {/* BACK */}
                  <motion.div
                    variants={item}
                    className="basis-full sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(33.333%-0.5rem)]"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl group"
                      onMouseEnter={handleBackEnter}
                      onMouseLeave={handleBackLeave}
                    >
                      <PhotoTile
                        src={photoBack}
                        badge="Back"
                        disabled={isUploading}
                        onClick={() => openPickerPose("back")}
                        size="sm"
                      />
                      {/* overlay de video */}
                      <video
                        ref={backVideoRef}
                        src={assets.vFour}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                 rounded-2xl z-[2]"
                        muted
                        loop
                        playsInline
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </CardShell>
            </motion.div>

            {/* Reference photos: start/compare (small tiles) */}
            <motion.div variants={item} className="lg:flex-1">
              <CardShell className="lg:flex-1">
                <SectionHeader
                  title="Reference photos"
                  subtitle="Start • Compare"
                  icon={
                    <IoMdPhotos className="text-white drop-shadow-sm text-[22px] inline-block" />
                  }
                />
                <motion.div
                  className="mt-4 flex flex-wrap gap-3"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <motion.div
                    variants={item}
                    className="basis-full sm:basis-[calc(50%-0.375rem)]"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl group"
                      onMouseEnter={handleStartEnter}
                      onMouseLeave={handleStartLeave}
                    >
                      <PhotoTile
                        src={photoStart}
                        badge={startUrl ? "Start" : "Start (add)"}
                        disabled={isUploading}
                        onClick={() => openPickerRef("start")}
                        size="sm"
                      />

                      {/* overlay de video */}
                      <video
                        ref={startVideoRef}
                        src={assets.vTwo}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                 rounded-2xl z-[2]"
                        muted
                        loop
                        playsInline
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    variants={item}
                    className="basis-full sm:basis-[calc(50%-0.375rem)]"
                  >
                    <PhotoTile
                      src={photoCompare}
                      badge={compareUrl ? "Compare" : "Compare (add)"}
                      disabled={isUploading}
                      onClick={() => openPickerRef("compare")}
                      size="sm"
                    />
                  </motion.div>
                </motion.div>
              </CardShell>
            </motion.div>
          </motion.div>

          {/* hidden input for all uploads */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </motion.div>
      </div>
    </div>
  );
};

/* ---------------- Subcomponents (visual style intact) ---------------- */

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative w-full max-w-[50rem] ${className}`}>
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-black/60 via-black/20 to-transparent opacity-80" />
      <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl text-white">
        <div className="pointer-events-none absolute -top-6 right-10 h-16 w-16 rounded-full bg-white/30 blur-2xl" />
        <div className="p-5 sm:p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <div className="flex items-center">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/80 to-cyan-400/80 shadow-lg ring-1 ring-white/30 sm:h-12 sm:w-12">
          {icon}
        </div>
        <h3 className="text-lg font-semibold tracking-tight sm:text-xl ml-3">
          {title}
        </h3>
      </div>
      {subtitle && (
        <p className="text-xs text-white/70 sm:text-sm mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}

function ProgressSnapshot({
  dateStr,
  isLoading,
  weightWithDelta,
  weightUnit,
  waistVal,
  bodyFatVal,
  steps,
  weightKg,
  waistCm,
  notes,
  tags,
}: {
  dateStr: string;
  isLoading: boolean;
  weightWithDelta: string;
  weightUnit?: string;
  waistVal: string;
  bodyFatVal: string;
  steps: string;
  weightKg: number | null;
  waistCm: number | null;
  notes: string;
  tags: string[];
}) {
  return (
    <>
      {/* header */}
      <div className=" mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/80 to-cyan-400/80 shadow-lg ring-1 ring-white/30 sm:h-12 sm:w-12">
          {/*<svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            className="drop-shadow-sm sm:w-[22px] sm:h-[22px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15V8a2 2 0 0 0-2-2h-3" />
            <path d="M3 15V8a2 2 0 0 1 2-2h-3" />
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M8 11v10M16 11v10" />
          </svg> */}
          <RiProgress5Fill className="text-white drop-shadow-sm sm:text-[22px]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Progress snapshot
          </h2>
          <p className="text-xs text-white/70 sm:text-sm">{dateStr}</p>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label={isLoading ? "Weight (loading…)" : "Weight"}
          value={weightWithDelta}
          unit={weightUnit}
        />
        <Stat
          label={isLoading ? "Waist (loading…)" : "Waist"}
          value={waistVal}
          unit={waistCm == null ? undefined : "cm"}
        />
        <Stat label="Body fat" value={bodyFatVal} unit="%" />
        <Stat label="Steps" value={steps} />
      </div>

      {/* bars */}
      <div className="mt-6 space-y-4">
        <Bar
          title="Weight goal"
          hint="→ 75 kg"
          percent={
            weightKg != null
              ? Math.max(0, Math.min(100, Math.round((75 / weightKg) * 100)))
              : 0
          }
        />
        <Bar
          title="Waist goal"
          hint="→ 80 cm"
          percent={
            waistCm != null
              ? Math.max(0, Math.min(100, Math.round((80 / waistCm) * 100)))
              : 0
          }
        />
      </div>

      {/* notes */}
      <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-3 sm:p-4">
        <p className="text-sm leading-relaxed text-white/90">{notes}</p>
      </div>

      {/* tags */}
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
    </>
  );
}

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

/** Imagen completa sin recorte; tamaño “sm” para tiles más compactos */
function PhotoTile({
  src,
  onClick,
  badge,
  disabled,
  size = "sm",
  className,
}: {
  src: string;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
  /** "sm" (compacto) o "md" (más alto) */
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  // alturas por tamaño (responsive) via CSS variable
  const cssHeights =
    size === "sm"
      ? `:root{--ph-h: 10rem}@media (min-width:640px){:root{--ph-h: 12rem}}@media (min-width:768px){:root{--ph-h: 14rem}}`
      : `:root{--ph-h: 13rem}@media (min-width:640px){:root{--ph-h: 16rem}}@media (min-width:768px){:root{--ph-h: 18rem}}`;

  return (
    <div
      className={`group relative flex items-center justify-center rounded-2xl overflow-hidden border border-white/60 bg-white/5 ${className}`}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        height: "var(--ph-h)",
      }}
      onClick={() => !disabled && onClick()}
    >
      <style>{cssHeights}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)] opacity-60 rounded-2xl pointer-events-none" />
      <img
        src={src}
        alt="Progress"
        className="h-full w-full object-cover z-[1]"
        draggable={false}
      />
      {badge && (
        <span className="pointer-events-none absolute whitespace-nowrap bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[1rem] font-medium text-cyan-300 shadow-sm z-[1]">
          {badge}
        </span>
      )}
    </div>
  );
}

export default ProgressFeatures;
