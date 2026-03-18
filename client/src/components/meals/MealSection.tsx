import React from "react";
import { Link } from "@tanstack/react-router";
import { motion, Variants } from "framer-motion";
import {
  ChefHat,
  Target,
  BarChart3,
  CalendarClock,
  Plus,
  ListChecks,
} from "lucide-react";
import assets from "@/assets";

// Variants
const parent = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
} as Variants;
const up = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
} as Variants;
const chipV = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 26,
      delay: 0.25 + i * 0.08,
    },
  }),
} as Variants;

const MealSection: React.FC = () => {
  return (
    <motion.section
      id="meals"
      className="relative py-16 md:py-24 mt-20"
      variants={parent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-10 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.figure
            variants={up}
            className="order-1 lg:order-none"
            whileHover={{ y: -4, scale: 1.005 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-emerald-400/30 via-sky-400/20 to-fuchsia-400/30 blur-xl"
                aria-hidden
                animate={{ opacity: [0.35, 0.6, 0.35] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <div className="relative overflow-hidden rounded-[2rem] border-6 border-gray-800 bg-white">
                <motion.img
                  src={assets.meal}
                  alt="Meal preview"
                  className="w-full object-cover aspect-[5/6] md:aspect-[4/5]"
                  loading="lazy"
                  whileInView={{ y: [0, -6, 0] }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 to-transparent" />

                <Chip className="absolute left-4 top-4" customDelay={0}>
                  460 kcal
                </Chip>
                <Chip className="absolute right-4 top-4" customDelay={0.1}>
                  P 35g · C 52g · F 18g
                </Chip>
                <motion.div
                  variants={up}
                  className="absolute bottom-4 left-4"
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 text-[11px] text-neutral-900 ring-1 ring-inset ring-neutral-200 backdrop-blur">
                    <CalendarClock className="h-3.5 w-3.5" /> Breakfast · Today
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.figure>

          <motion.div variants={up} className="space-y-6">
            <motion.p
              variants={up}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200"
            >
              <ChefHat className="h-4 w-4" /> Meals & Macros
            </motion.p>

            <motion.h2
              variants={up}
              className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
            >
              Eat smart, track better —
              <span className="block text-[.9em] font-normal text-neutral-700">
                recipes, custom foods, and daily macro targets in one place.
              </span>
            </motion.h2>

            <motion.ul variants={parent} className="space-y-3">
              <motion.li variants={up}>
                <Feature
                  icon={<ListChecks className="h-4 w-4" />}
                  title="Day timeline"
                  desc="Breakfast, lunch, dinner & snacks neatly organized by date."
                />
              </motion.li>
              <motion.li variants={up}>
                <Feature
                  icon={<BarChart3 className="h-4 w-4" />}
                  title="Auto nutrition"
                  desc="Macros per 100g or per serving—no spreadsheets needed."
                />
              </motion.li>
              <motion.li variants={up}>
                <Feature
                  icon={<Target className="h-4 w-4" />}
                  title="Macro goals"
                  desc="Set kcal / protein / carbs / fat and see your progress at a glance."
                />
              </motion.li>
            </motion.ul>

            <motion.div
              variants={up}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/meals/create"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-2 text-neutral-900 shadow-sm transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Log a meal
              </Link>
              <Link
                to="/meals"
                className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                Browse meals
              </Link>
            </motion.div>

            <motion.dl
              variants={parent}
              className="grid grid-cols-2 gap-4 text-sm text-neutral-600 sm:max-w-md"
            >
              <motion.div variants={up}>
                <Stat kpi="92%" label="hit daily targets" />
              </motion.div>
              <motion.div variants={up}>
                <Stat kpi="-18%" label="kcal variance" />
              </motion.div>
            </motion.dl>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

function Chip({
  children,
  className = "",
  customDelay = 0,
}: React.PropsWithChildren<{ className?: string; customDelay?: number }>) {
  return (
    <motion.div
      variants={chipV}
      custom={customDelay}
      className={`select-none rounded-xl bg-white/90 px-3 py-2 text-[11px] text-neutral-900 ring-1 ring-inset ring-neutral-200 backdrop-blur ${className}`}
    >
      {children}
    </motion.div>
  );
}

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
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
        {icon}
      </div>
      <div>
        <div className="font-medium text-neutral-900">{title}</div>
        <p className="text-neutral-600">{desc}</p>
      </div>
    </div>
  );
}

function Stat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
      <div className="text-lg font-semibold text-neutral-900">{kpi}</div>
      <div className="text-neutral-500">{label}</div>
    </div>
  );
}

export default MealSection;
