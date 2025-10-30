import React, { useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import assets from "@/assets";

const iconObjs = [
  { src: assets.prod1, alt: "Product 1" },
  { src: assets.prod2, alt: "Product 2" },
  { src: assets.prod3, alt: "Product 3" },
  { src: assets.prod4, alt: "Product 4" },
  { src: assets.prod5, alt: "Product 5" },
  { src: assets.prod6, alt: "Product 6" },
  { src: assets.prod7, alt: "Product 7" },
  { src: assets.prod8, alt: "Product 8" },
  { src: assets.prod9, alt: "Product 9" },
];

// Proteína (g) improvisada por producto
const proteins = [12, 8, 24, 5, 30, 18, 10, 14, 22];

const container = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.06 },
  },
} satisfies Variants;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
} satisfies Variants;

const zoomIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
} satisfies Variants;

const ProteinGaugeCard = () => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const maxProtein = useMemo(() => Math.max(...proteins), []);
  const currentProtein = hoverIdx !== null ? proteins[hoverIdx] : 0;
  const progress = hoverIdx !== null ? currentProtein / maxProtein : 0;

  // SVG gauge sizing
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      className="relative w-[58rem]"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Card glass con el mismo look & feel que ProgressFeatures */}
      <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl text-white">
        {/* brillo suave */}
        <div className="pointer-events-none absolute -top-6 right-8 h-16 w-16 rounded-full bg-white/30 blur-2xl" />

        <div className="p-5 sm:p-6 md:p-8">
          {/* Header */}
          <motion.div
            className="mb-5 flex items-end justify-between"
            variants={fadeUp}
          >
            <div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                Protein picks
              </h2>
              <p className="mt-1 text-xs text-white/70 sm:text-sm">
                Hover a product to see protein per serving.
              </p>
            </div>
            <span className="hidden sm:inline-flex h-[3px] w-20 rounded-full bg-white/25" />
          </motion.div>

          {/* Layout: grid (iconos + gauge) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_280px]">
            {/* Grid de iconos (cards glass) */}
            <motion.div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
              variants={container}
            >
              {iconObjs.map((icon, i) => (
                <motion.article
                  key={i}
                  variants={fadeUp}
                  className="group w-[8rem] relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-[0_6px_28px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ y: -4 }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  {/* Index badge */}
                  <div className="pointer-events-none absolute right-2 top-2 rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/90 shadow-sm backdrop-blur">
                    #{String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="flex flex-col items-center p-4">
                    <motion.div
                      className="relative size-1.5  sm:size-24 rounded-xl ring-1 ring-inset ring-white/20 overflow-hidden transition-colors duration-300"
                      variants={zoomIn}
                    >
                      <img
                        src={icon.src}
                        alt={icon.alt}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Shine */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </motion.div>

                    <h3 className="mt-3 line-clamp-1 text-center text-sm font-medium text-white/90">
                      {icon.alt}
                    </h3>

                    {/* Tooltip mini */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="rounded-full bg-neutral-700 text-white font-bold text-[10px] px-6 py-2 shadow-sm backdrop-blur">
                        View {icon.alt}
                      </span>
                    </div>
                  </div>

                  {/* Highlight border on hover */}
                  <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-colors duration-300 group-hover:ring-white/30" />
                </motion.article>
              ))}
            </motion.div>

            {/* Gauge circular */}
            <motion.div
              variants={container}
              className="flex items-center justify-center"
            >
              <div className="relative w-full max-w-[260px] rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
                <div className="text-center mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/70">
                    Protein meter
                  </p>
                  <p className="text-base font-semibold">
                    {hoverIdx !== null
                      ? iconObjs[hoverIdx].alt
                      : "Hover a product"}
                  </p>
                </div>

                <div
                  className="relative mx-auto"
                  style={{ width: size, height: size }}
                >
                  <svg width={size} height={size} className="block mx-auto">
                    {/* Base ring */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={stroke}
                    />
                    {/* Progress ring */}
                    <motion.circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progress)}
                      initial={false}
                      animate={{
                        strokeDashoffset: circumference * (1 - progress),
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 18,
                      }}
                      style={{
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                        filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.2))",
                      }}
                    />
                  </svg>

                  {/* Centro */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[2.5rem] sm:text-[3rem] font-extrabold leading-none">
                      {currentProtein}
                      <span className="text-xl font-semibold">g</span>
                    </div>
                    <div className="mt-1 text-[11px] tracking-wider uppercase text-white/70">
                      Protein
                    </div>
                    {hoverIdx !== null && (
                      <motion.div
                        className="mt-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 140,
                          damping: 14,
                        }}
                      >
                        #{String(hoverIdx + 1).padStart(2, "0")} •{" "}
                        {Math.round(progress * 100)}%
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-center text-sm text-white/70">
                  Max: {maxProtein}g
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProteinGaugeCard;
