import React from "react";
import { Link } from "@tanstack/react-router";
import { motion, Variants } from "framer-motion";
import { Dumbbell, Clock3, Copy, Archive } from "lucide-react";
import assets from "@/assets";

// Motion variants
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
  return (
    <motion.section
      id="routines"
      className="relative overflow-hidden py-16 md:py-24"
      variants={sectionV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* BG flair */}
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
          {/* Left: copy */}
          <motion.div variants={upV} className="space-y-6">
            <motion.p
              variants={upV}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200"
            >
              <Dumbbell className="h-4 w-4" /> Routines
            </motion.p>

            <motion.h2
              variants={upV}
              className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
            >
              Build, run, and track your{" "}
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900 bg-clip-text text-transparent">
                workout routines
              </span>
            </motion.h2>

            <motion.p variants={upV} className="max-w-xl text-neutral-600">
              Create reusable templates, duplicate variations for each training
              phase, archive old cycles, and mark sessions as performed to keep
              your progress front and center.
            </motion.p>

            <motion.ul
              variants={sectionV}
              className="grid gap-3 sm:grid-cols-2"
            >
              <motion.li variants={upV}>
                <Feature
                  icon={<Copy className="h-4 w-4" />}
                  title="Duplicate fast"
                  desc="Iterate safely with one click copies."
                />
              </motion.li>
              <motion.li variants={upV}>
                <Feature
                  icon={<Archive className="h-4 w-4" />}
                  title="Archive cycles"
                  desc="Declutter without losing history."
                />
              </motion.li>
              <motion.li variants={upV}>
                <Feature
                  icon={<Clock3 className="h-4 w-4" />}
                  title="EMOM & timers"
                  desc="Warm-ups, EMOMs and countdowns."
                />
              </motion.li>
              <motion.li variants={upV}>
                <Feature
                  icon={<Dumbbell className="h-4 w-4" />}
                  title="Sets & cues"
                  desc="Loads, RIR, tempo and notes."
                />
              </motion.li>
            </motion.ul>

            <motion.div
              variants={upV}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link
                to="/routines"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:opacity-90"
              >
                Explore routines
              </Link>
              <Link
                to="/routines/create"
                className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-neutral-900 shadow-sm transition hover:bg-neutral-50"
              >
                Create a routine
              </Link>
            </motion.div>

            <motion.dl
              variants={sectionV}
              className="mt-4 grid grid-cols-2 gap-4 text-sm text-neutral-600 sm:max-w-lg"
            >
              <motion.div variants={upV}>
                <Stat kpi="2.3k+" label="Routines created" />
              </motion.div>
              <motion.div variants={upV}>
                <Stat kpi="14k+" label="Workouts logged" />
              </motion.div>
            </motion.dl>
          </motion.div>

          {/* Right: device mock + image */}
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
            {/* Phone frame */}
            <div className="relative mx-auto aspect-[9/19] w-full rounded-[2.2rem] border-6 border-gray-800 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <div className="absolute inset-0 rounded-[2.1rem]">
                <img
                  src={assets.routines}
                  alt="Routines preview"
                  className="h-full w-full rounded-[1.8rem] object-cover"
                  loading="lazy"
                  //whileInView={{ y: [0, -6, 0] }}
                  //viewport={{ once: false, amount: 0.4 }}
                  //transition={{
                  //  duration: 6,
                  //  repeat: Infinity,
                  //  ease: "easeInOut",
                  //}}
                />
              </div>
              {/* Notch */}
              <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-neutral-900/90" />
            </div>

            {/* Floating stickers */}
            <motion.div
              variants={chipV}
              custom={0}
              className="absolute -right-3 top-6 hidden select-none rounded-xl bg-white/90 px-3 py-2 text-[11px] text-neutral-800 ring-1 ring-inset ring-neutral-200 backdrop-blur md:block"
            >
              <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />{" "}
              Marked performed
            </motion.div>
            <motion.div
              variants={chipV}
              custom={0.1}
              className="absolute -left-3 bottom-10 hidden select-none rounded-xl bg-white/90 px-3 py-2 text-[11px] text-neutral-800 ring-1 ring-inset ring-neutral-200 backdrop-blur md:block"
            >
              <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-sky-500" />{" "}
              Duplicated
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
    <li className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
        {icon}
      </div>
      <div>
        <div className="font-medium text-neutral-900">{title}</div>
        <p className="text-neutral-600">{desc}</p>
      </div>
    </li>
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

export default RoutineSection;
