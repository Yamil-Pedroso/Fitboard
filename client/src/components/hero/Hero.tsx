import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import assets from "@/assets";

const Hero = () => {
  const { t } = useTranslation("hero");

  return (
    <section className="relative w-full">
      <div className="relative w-full h-[36rem] sm:h-[40rem] lg:h-[44rem] overflow-hidden bg-black">
        <img
          src={assets.fitnut}
          alt="Fitboard"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        <div
          className="absolute inset-0 bg-gradient-to-r
                        from-black/80
                        via-black/40
                        to-transparent
                        sm:from-black/70 sm:via-black/30"
        />

        <div className="relative z-10 h-full flex items-center">
          <div className="flex flex-col gap-5 sm:gap-6 max-w-xl px-4 sm:px-8 lg:px-16">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white"
            >
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
              <br />
              {t("titleLine3")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-white/70 text-sm sm:text-base md:text-lg max-w-md"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <Link to="/auth/register">
                <button className="bg-lime-400 text-black px-5 py-3 rounded-full font-semibold text-sm sm:text-base hover:scale-105 transition w-full sm:w-auto">
                  {t("startFree")}
                </button>
              </Link>
              <Link to="/auth/login">
                <button className="bg-white/10 backdrop-blur px-5 py-3 rounded-full text-white text-sm sm:text-base hover:bg-white/20 transition w-full sm:w-auto">
                  {t("learnMore")}
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3 }}
          className="hidden md:block absolute bottom-6 left-6 bg-white/90 backdrop-blur rounded-xl p-4 w-[200px]"
        >
          <p className="text-sm text-gray-500">{t("dailyCalories")}</p>

          <h3 className="text-lg font-bold text-gray-900">2,340 kcal</h3>

          <p className="text-xs text-gray-400 mt-1">{t("balancedNutrition")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6
                     bg-lime-400 text-black rounded-xl p-4 sm:p-5
                     w-[180px] sm:w-[220px]"
        >
          <h3 className="font-bold text-sm sm:text-lg">{t("journeyTitle")}</h3>

          <p className="text-xs sm:text-sm mt-1">{t("journeySubtitle")}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
