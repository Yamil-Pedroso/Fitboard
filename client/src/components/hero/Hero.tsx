import { motion } from "framer-motion";
import assets from "@/assets";

const Hero = () => {
  return (
    <section className="relative">
      <img
        src={assets.deco1}
        alt=""
        aria-hidden="true"
        className="absolute top-[30rem] left-2 w-32 h-35 z-[0]
                   max-[480px]:top-[26rem] max-[480px]:w-24 max-[480px]:h-24
                   sm:left-4 md:left-8"
      />

      <div
        className="relative flex flex-col items-center justify-center mt-[5rem] h-[40rem] p-8 gap-10 border-6 border-[#393a3c] shadow-lg overflow-hidden rounded-[2.2rem]
                   max-[480px]:h-[30rem] lg:h-[44rem]"
      >
        <img
          src={assets.fitnut}
          alt="FitNut Background"
          className="w-full h-full object-cover rounded-[2.2rem]"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 z-10">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="text-6xl font-bold text-center max-w-4xl text-amber-400
                       max-[1024px]:text-5xl max-[768px]:text-4xl max-[480px]:text-3xl"
          >
            Transform your body, empower your mind.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="text-center
                       max-[1024px]:text-lg max-[768px]:text-base max-[480px]:text-sm"
          >
            Find the balance between smart nutrition and effective training.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
