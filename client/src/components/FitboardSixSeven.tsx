"use client";

import { motion } from "framer-motion";

export default function FitboardSixSeven() {
  return (
    <div className="bg-black h-screen flex items-center justify-center flex-col gap-12">
      {/* 💪 Dumbbell (más pesada, movimiento lento) */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 2.5, // 👈 más lento (peso real)
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-16 bg-lime-400" />
          <div className="w-12 h-24 bg-lime-400 rounded-sm" />
          <div className="w-32 h-8 bg-lime-400 rotate-12" />
          <div className="w-12 h-24 bg-lime-400 rounded-sm" />
          <div className="w-6 h-16 bg-lime-400" />
        </div>
      </motion.div>

      {/* 🔥 Six Seven (como reps lentas) */}
      <div className="flex items-center gap-10 text-lime-400 text-7xl md:text-9xl font-extrabold font-mono">
        {/* 6 */}
        <motion.span
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          6
        </motion.span>

        {/* 7 */}
        <motion.span
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2.5,
            delay: 0.5, // 👈 desfase (como siguiente rep)
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          7
        </motion.span>
      </div>

      {/* 🚀 FITBOARD */}
      <motion.div
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className="text-white text-3xl md:text-5xl font-bold tracking-[0.4em]"
      >
        FITBOARD
      </motion.div>
    </div>
  );
}
