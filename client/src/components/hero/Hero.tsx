import { motion } from "framer-motion";
import assets from "@/assets";

const Hero = () => {
  return (
    <section className="relative w-full">
      <div className="relative w-full h-[36rem] sm:h-[40rem] lg:h-[44rem] overflow-hidden bg-black">
        {/* Background */}
        <img
          src={assets.fitnut}
          alt="Fitboard"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        {/* Gradient overlay (suave) */}
        <div
          className="absolute inset-0 bg-gradient-to-r
                        from-black/80
                        via-black/40
                        to-transparent
                        sm:from-black/70 sm:via-black/30"
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="flex flex-col gap-5 sm:gap-6 max-w-xl px-4 sm:px-8 lg:px-16">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white"
            >
              Eat smarter.
              <br />
              Train better.
              <br />
              Track everything.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-white/70 text-sm sm:text-base md:text-lg max-w-md"
            >
              Your all-in-one fitness system for meals, routines and progress.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <button className="bg-lime-400 text-black px-5 py-3 rounded-full font-semibold text-sm sm:text-base hover:scale-105 transition w-full sm:w-auto">
                Start for free →
              </button>

              <button className="bg-white/10 backdrop-blur px-5 py-3 rounded-full text-white text-sm sm:text-base hover:bg-white/20 transition w-full sm:w-auto">
                Learn more
              </button>
            </motion.div>
          </div>
        </div>

        {/* Floating Card LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3 }}
          className="hidden md:block absolute bottom-6 left-6 bg-white/90 backdrop-blur rounded-xl p-4 w-[200px]"
        >
          <p className="text-sm text-gray-500">Daily Calories</p>
          <h3 className="text-lg font-bold text-gray-900">2,340 kcal</h3>
          <p className="text-xs text-gray-400 mt-1">
            Balanced nutrition achieved
          </p>
        </motion.div>

        {/* Floating Card RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6
                     bg-lime-400 text-black rounded-xl p-4 sm:p-5
                     w-[180px] sm:w-[220px]"
        >
          <h3 className="font-bold text-sm sm:text-lg">Start your journey</h3>
          <p className="text-xs sm:text-sm mt-1">
            Build your fitness system today.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
