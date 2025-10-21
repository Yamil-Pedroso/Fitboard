import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96  p-8 gap-10 border-6 border-[#393a3c] shadow-lg ">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
        className="text-6xl font-bold text-center max-w-4xl text-black"
      >
        Transform your body, empower your mind.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
        className="text-center text-black"
      >
        Find the balance between smart nutrition and effective training.
      </motion.p>
    </div>
  );
};

export default Hero;
