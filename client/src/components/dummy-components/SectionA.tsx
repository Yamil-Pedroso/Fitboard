import { Link } from "@tanstack/react-router";
import assets from "@/assets";
import { RiArrowRightUpFill } from "react-icons/ri";
import { motion, Variants } from "framer-motion";

const fnImages = [
  { category: "Meal Plans", src: assets.fn1, alt: "Feature 1" },
  { category: "Workout Routines", src: assets.fn2, alt: "Feature 2" },
  { category: "Progress Tracking", src: assets.fn3, alt: "Feature 3" },
  { category: "Community Support", src: assets.fn4, alt: "Feature 4" },
];

// Smooth staggered fade-up animation
const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      ease: "easeOut",
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, willChange: "transform, opacity" },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1], // cubic-bezier smoother curve
    },
  },
};

const SectionA = () => {
  return (
    <motion.div
      className="px-4 sm:px-6 lg:px-12"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {/* Header */}
      <motion.div
        className="mt-26 mb-6 flex flex-col items-center text-center gap-4"
        variants={fadeUp}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-black">
          Fitness and Nutrition
        </h1>
        <p className="max-w-2xl text-black text-sm sm:text-base">
          Welcome to the Yoga and Nutrition section! Here you'll find resources
          and tips to enhance your well-being through mindful practices and
          healthy eating.
        </p>
      </motion.div>

      {/* Boxes */}
      <motion.div
        className="flex flex-col items-center mb-12"
        variants={fadeUp}
      >
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {[
            { title: "Box 1", content: "Content" },
            { title: "Box 2", content: "Content" },
          ].map((box, index) => (
            <motion.div
              key={index}
              className="w-[10rem] sm:w-[12rem] md:w-[14rem] flex justify-center shadow-[-3px_3px_0px_0px_rgb(0_0_0/0.8)] rounded-[1rem]"
              variants={fadeUp}
            >
              <div className="bg-white text-center text-[#393a3c] flex flex-col justify-center items-center border-6 border-[#393a3c] p-4 rounded-[1rem] w-full">
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  {box.title}
                </h2>
                <p className="text-sm md:text-base">{box.content}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Image Cards */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center mt-8 gap-6">
          {fnImages.map((src, index) => (
            <motion.div
              key={index}
              className="w-full sm:w-[18rem] md:w-[22rem] lg:w-[25rem] border-6 border-[#393a3c] overflow-hidden shadow-lg rounded-[2rem]"
              variants={fadeUp}
            >
              <div className="flex justify-between items-center bg-[#bbbbbb] text-[#393a3c] p-4 border-b-6 border-[#393a3c]">
                <h3 className="text-base md:text-lg font-semibold">
                  {src.category}
                </h3>
                <Link to="/meals">
                  <RiArrowRightUpFill className="inline-block ml-2 text-3xl md:text-4xl cursor-pointer hover:scale-110 hover:text-emerald-600 transition-all duration-300" />
                </Link>
              </div>
              <div className="w-full h-[12rem] sm:h-[14rem] md:h-[16rem] overflow-hidden">
                <img
                  src={src.src}
                  alt={src.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SectionA;
