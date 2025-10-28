import React from "react";
import assets from "../../assets";
import { motion, useReducedMotion, Variants } from "framer-motion";

type Icon = { src: string; alt: string };

const iconImages: Icon[] = [
  { src: assets.icon1, alt: "Icon 1" },
  { src: assets.icon2, alt: "Icon 2" },
  { src: assets.icon3, alt: "Icon 3" },
  { src: assets.icon4, alt: "Icon 4" },
  { src: assets.icon5, alt: "Icon 5" },
  { src: assets.icon6, alt: "Icon 6" },
];

const DMealComp: React.FC = () => {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: reduce
        ? { staggerChildren: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  } as Variants;

  const item = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.9, y: reduce ? 0 : 8 },
    show: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: reduce
        ? { duration: 0.2 }
        : { type: "spring", stiffness: 300, damping: 22, delay: i * 0.04 },
    }),
  } as Variants;

  return (
    <section aria-labelledby="dmeal-title" className="w-full">
      <div className="mx-auto max-w-6xl rounded-3xl border border-neutral-800 bg-[#8fae2c]  sm:p-6 md:p-8 shadow-xl backdrop-blur">
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          aria-label="Meal icons"
          className="
            flex gap-3 overflow-x-auto
            sm:overflow-visible sm:grid sm:grid-cols-3 sm:gap-4
            md:grid-cols-6
          "
          style={{ scrollSnapType: "x mandatory" }}
        >
          {iconImages.map((icon, index) => (
            <motion.li
              key={icon.alt ?? index}
              variants={item}
              custom={index}
              className="
                snap-start shrink-0
                w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                grid place-items-center rounded-full p-2
                bg-neutral-800/60 ring-1 ring-white/10 shadow-lg
                hover:ring-white/20 hover:shadow-2xl transition-all duration-300
              "
            >
              <img
                src={icon.src}
                alt={icon.alt}
                loading="lazy"
                decoding="async"
                draggable={false}
                width={96}
                height={96}
                className="w-3/4 h-3/4 object-contain select-none pointer-events-none"
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
};

export default DMealComp;
