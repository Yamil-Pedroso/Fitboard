import { motion } from "framer-motion";
import assets from "@/assets";

const Hero = () => {
  return (
    <>
      <img
        src={assets.deco1}
        alt="Decoration"
        className="absolute top-[30rem] left-2 w-32 h-35 z-[0]"
      />
      <div className="flex flex-col items-center justify-center h-[40rem]  p-8 gap-10 border-6 border-[#393a3c] shadow-lg overflow-hidden rounded-[2.2rem]">
        <img
          src={assets.fitnut}
          alt="FitNut Background"
          className="w-full h-full object-cover rounded-[2.2rem]"
        />
        <div className="absolute flex flex-col items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="text-6xl font-bold text-center max-w-4xl text-amber-400"
          >
            Transform your body, empower your mind.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="text-center "
          >
            Find the balance between smart nutrition and effective training.
          </motion.p>
        </div>
      </div>
    </>
  );
};

export default Hero;
