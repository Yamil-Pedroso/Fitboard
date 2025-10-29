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

// Proteína improvisada por producto (g)
const proteins = [12, 8, 24, 5, 30, 18, 10, 14, 22];

const container = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
} satisfies Variants;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110, damping: 16 },
  },
} satisfies Variants;

const zoomIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
} satisfies Variants;

const SectionC = () => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const maxProtein = useMemo(() => Math.max(...proteins), []);
  const currentProtein = hoverIdx !== null ? proteins[hoverIdx] : 0;
  const progress = hoverIdx !== null ? currentProtein / maxProtein : 0;

  // SVG circle sizing
  const size = 220;
  const stroke = 16; // grosor blanco solicitado
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.section
      className="mt-12"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="flex flex-col justify-center items-center">
        <h1>
          <span className="text-4xl font-bold text-black">Section C</span>
        </h1>

        <h2>
          <span className="ml-4 text-lg text-black">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </span>
        </h2>
      </div>
      <motion.div
        className="mx-auto border-4 border-[#393a3c] bg-[#ebeae2] p-8 shadow-sm rounded-[2.2rem] mt-10"
        variants={zoomIn}
      >
        {/* Header */}
        <motion.div
          className="mb-6 flex items-end justify-between"
          variants={fadeUp}
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#393a3c] tracking-tight">
              Product Icons
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Hover a product to see its protein level.
            </p>
          </div>
          <span className="hidden sm:inline-flex h-[3px] w-24 rounded-full bg-zinc-300/80" />
        </motion.div>

        {/* Layout: Grid + Gauge lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Grid (mantengo tus estilos de cards tal cual) */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
            variants={container}
          >
            {iconObjs.map((icon, i) => (
              <motion.article
                key={i}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                whileHover={{ y: -4 }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                {/* Badge / index (numeración linda) */}
                <div className="pointer-events-none absolute right-2 top-2 rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 shadow-sm">
                  #{String(i + 1).padStart(2, "0")}
                </div>

                {/* Card body */}
                <div className="flex flex-col items-center p-4">
                  <motion.div
                    className="relative size-20 sm:size-24 rounded-xl ring-1 ring-inset ring-zinc-200 overflow-hidden"
                    variants={zoomIn}
                    whileInView="visible"
                    initial="hidden"
                    viewport={{ once: true, amount: 0.4 }}
                  >
                    <img
                      src={icon.src}
                      alt={icon.alt}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* Shine */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </motion.div>

                  <h3 className="mt-3 line-clamp-1 text-center text-sm font-medium text-zinc-700">
                    {icon.alt}
                  </h3>

                  {/* Mini tooltip al hover */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="rounded-full bg-zinc-900 text-white text-[10px] px-2 py-1 shadow-sm">
                      View {icon.alt}
                    </span>
                  </div>
                </div>

                {/* Border highlight on hover */}
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-colors duration-300 group-hover:ring-zinc-300/90" />
              </motion.article>
            ))}
          </motion.div>

          {/* Gauge lateral (círculo hueco con trazo blanco que crece) */}
          <motion.div
            variants={container}
            className="flex items-center justify-center"
          >
            <div className="relative rounded-3xl border-4 border-[#393a3c] bg-[#ebeae2] p-6 w-full max-w-[280px]">
              <div className="text-center mb-4">
                <p className="text-xs uppercase tracking-wider text-[#393a3c]/80">
                  Protein meter
                </p>
                <p className="text-lg font-semibold text-[#393a3c]">
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
                  {/* Base ring (sutil), círculo hueco */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={stroke}
                  />
                  {/* Progress ring (blanco) */}
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
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "50% 50%",
                      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))",
                    }}
                  />
                </svg>

                {/* Contenido centrado */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[3rem] font-extrabold text-[#393a3c] leading-none">
                    {currentProtein}
                    <span className="text-xl font-semibold">g</span>
                  </div>
                  <div className="mt-1 text-[11px] tracking-wider uppercase text-[#393a3c]/70">
                    Protein
                  </div>
                  {hoverIdx !== null && (
                    <motion.div
                      className="mt-3 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#393a3c] shadow-sm"
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

              {/* Nota/max */}
              <div className="mt-4 text-center text-[2rem] text-[#393a3c]/70">
                Max: {maxProtein}g
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default SectionC;
