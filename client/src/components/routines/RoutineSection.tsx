import React from "react";
import { Link } from "@tanstack/react-router";
import { motion, Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Dumbbell, Clock3, Copy, Archive } from "lucide-react";
import assets from "@/assets";

const sectionV = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
} as Variants;

const upV = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
} as Variants;

const chipV = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 26,
      delay: 0.2 + i * 0.08,
    },
  }),
} as Variants;

const RoutineSection: React.FC = () => {
  const { t } = useTranslation("routines");

  return (
    <motion.section
      id="routines"
      className="relative overflow-hidden py-16 md:py-24"
      variants={sectionV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-300/30 via-sky-300/20 to-fuchsia-300/30 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gradient-to-tr from-fuchsia-300/30 via-emerald-300/20 to-sky-300/30 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div variants={upV} className="space-y-6">
            <motion.p
              variants={upV}
              className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-black ring-1 ring-inset ring-neutral-200"
            >
              <Dumbbell className="h-4 w-4" />
              {t("badge")}
            </motion.p>

            <motion.h2
              variants={upV}
              className="text-3xl font-bold tracking-tight app-text sm:text-4xl"
            >
              {t("titlePrefix")}{" "}
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text app-text">
                {t("titleHighlight")}
              </span>
            </motion.h2>

            <motion.p variants={upV} className="max-w-xl settings-muted">
              {t("subtitle")}
            </motion.p>

            <motion.ul
              variants={sectionV}
              className="grid gap-3 sm:grid-cols-2"
            >
              <motion.li variants={upV}>
                <Feature
                  icon={<Copy className="h-4 w-4" />}
                  title={t("duplicateTitle")}
                  desc={t("duplicateDesc")}
                />
              </motion.li>

              <motion.li variants={upV}>
                <Feature
                  icon={<Archive className="h-4 w-4" />}
                  title={t("archiveTitle")}
                  desc={t("archiveDesc")}
                />
              </motion.li>

              <motion.li variants={upV}>
                <Feature
                  icon={<Clock3 className="h-4 w-4" />}
                  title={t("timersTitle")}
                  desc={t("timersDesc")}
                />
              </motion.li>

              <motion.li variants={upV}>
                <Feature
                  icon={<Dumbbell className="h-4 w-4" />}
                  title={t("setsTitle")}
                  desc={t("setsDesc")}
                />
              </motion.li>
            </motion.ul>

            <motion.div
              variants={upV}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/routines"
                className="inline-flex items-center justify-center rounded-2xl bg-lime-400 px-4 py-2 text-black shadow-sm transition hover:opacity-90"
              >
                {t("exploreRoutines")}
              </Link>

              <Link
                to="/routines/create"
                className="inline-flex items-center justify-center rounded-2xl border px-4 py-2 app-secondary-action shadow-sm transition"
              >
                {t("createRoutine")}
              </Link>
            </motion.div>

            <motion.dl
              variants={sectionV}
              className="mt-4 grid grid-cols-2 gap-4 text-sm app-muted sm:max-w-lg"
            >
              <motion.div variants={upV}>
                <Stat kpi="2.3k+" label={t("routinesCreated")} />
              </motion.div>

              <motion.div variants={upV}>
                <Stat kpi="14k+" label={t("workoutsLogged")} />
              </motion.div>
            </motion.dl>
          </motion.div>

          <motion.div
            variants={upV}
            transition={{ delay: 0.05 }}
            className="relative mx-auto w-full max-w-sm"
            whileHover={{
              y: -4,
              scale: 1.01,
              transition: { type: "spring", stiffness: 220, damping: 18 },
            }}
          >
            <div className="relative mx-auto aspect-[9/19] w-full rounded-[2.2rem] border-6 border-gray-800 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <div className="absolute inset-0 rounded-[2.1rem]">
                <img
                  src={assets.routines}
                  alt="Routines preview"
                  className="h-full w-full rounded-[1.8rem] object-cover"
                  loading="lazy"
                />
              </div>

              <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-neutral-900/90" />
            </div>

            <motion.div
              variants={chipV}
              custom={0}
              className="absolute -right-3 top-6 hidden select-none rounded-xl bg-white/90 px-3 py-2 text-[11px] text-neutral-800 ring-1 ring-inset ring-neutral-200 backdrop-blur md:block"
            >
              <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-lime-400" />
              {t("markedPerformed")}
            </motion.div>

            <motion.div
              variants={chipV}
              custom={0.1}
              className="absolute -left-3 bottom-10 hidden select-none rounded-xl bg-white/90 px-3 py-2 text-[11px] text-neutral-800 ring-1 ring-inset ring-neutral-200 backdrop-blur md:block"
            >
              <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-sky-500" />
              {t("duplicated")}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border app-surface p-3 shadow-sm">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--app-surface-muted)]">
        {icon}
      </div>

      <div>
        <div className="font-medium">{title}</div>
        <p className="app-muted">{desc}</p>
      </div>
    </li>
  );
}

function Stat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div className="rounded-2xl border app-surface p-3 text-center shadow-sm">
      <div className="text-lg font-semibold">{kpi}</div>
      <div className="app-muted">{label}</div>
    </div>
  );
}

export default RoutineSection;
