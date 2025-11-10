import React, { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";

/* ============== Hook: in-view una sola vez ============== */
function useInViewOnce<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const el = ref.current;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px", ...options }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, options]);

  return { ref, inView } as const;
}

/* ============== Typewriter suave + callback onDone ============== */
function Typewriter({
  text,
  start,
  speed = 18,
  ramp = 140,
  className,
  onDone,
}: {
  text: string;
  start: boolean;
  speed?: number;
  ramp?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches && start) {
      setVisible(true);
      setIdx(text.length);
      onDone?.();
    }
  }, [start, text.length, onDone]);

  useEffect(() => {
    if (!start) return;
    const id = window.setTimeout(() => setVisible(true), ramp);
    return () => window.clearTimeout(id);
  }, [start, ramp]);

  useEffect(() => {
    if (!start) return;
    if (idx >= text.length) {
      onDone?.();
      return;
    }
    const id = window.setTimeout(() => setIdx((i) => i + 1), speed);
    return () => window.clearTimeout(id);
  }, [start, idx, text.length, speed, onDone]);

  return (
    <span
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 240ms ease",
        willChange: "opacity",
      }}
    >
      {text.slice(0, idx)}
      {idx < text.length ? (
        <span className="inline-block animate-pulse">|</span>
      ) : null}
    </span>
  );
}

/* ================= Datos ================= */
const loremContent = [
  {
    title: "Lorem Ipsum 1",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    color: "bg-red-200",
  },
  {
    title: "Lorem Ipsum 2",
    content:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    color: "bg-blue-200",
  },
  {
    title: "Lorem Ipsum 3",
    content:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    color: "bg-green-200",
  },
  {
    title: "Lorem Ipsum 4",
    content:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    color: "bg-yellow-200",
  },
];

const smallCircle = [
  {
    title: "Lorem Ipsum 1",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    color: "bg-red-400",
  },
  {
    title: "Lorem Ipsum 2",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    color: "bg-blue-400",
  },
  {
    title: "Lorem Ipsum 3",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    color: "bg-green-400",
  },
];

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
} as Variants;

const SectionB = () => {
  const { ref: smallRef, inView } = useInViewOnce<HTMLDivElement>();
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    if (inView && current === -1) setCurrent(0);
  }, [inView, current]);

  return (
    <motion.div
      className="w-full flex flex-col px-4 sm:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
    >
      <div className="mx-auto flex flex-col items-center text-center">
        <motion.h2
          className="text-black mt-10 text-3xl sm:text-4xl font-bold"
          variants={fadeUp}
        >
          Section B
        </motion.h2>
        <motion.p
          className="text-black text-sm sm:text-base"
          variants={fadeUp}
          custom={0.1}
        >
          This is the content for Section B.
        </motion.p>

        <motion.div
          className="w-full flex flex-col lg:flex-row mt-10 gap-6 lg:gap-10 items-center justify-center"
          variants={fadeUp}
          custom={0.2}
        >
          {/* Small Circles */}
          <motion.div
            ref={smallRef}
            className="shadow-[-3px_3px_0px_0px_rgb(0_0_0/0.8)] rounded-[2.2rem] w-full sm:w-[90%] md:w-[35rem] lg:w-[37rem] flex justify-center"
            variants={fadeUp}
            custom={0.3}
          >
            <div className="bg-white p-4 sm:p-6 shadow-lg border-6 border-[#393a3c] rounded-[2.2rem] overflow-hidden relative w-full h-[22rem] sm:h-[25rem]">
              {smallCircle.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex gap-4 sm:gap-8 mb-4 absolute mt-6 sm:mt-8"
                  style={{ top: i * 80, left: 20 }}
                  variants={fadeUp}
                  custom={0.4 + i * 0.1}
                >
                  <div className="mt-2">
                    <div
                      className={`w-3 h-3 ${item.color} flex rounded-full border-2 border-gray-600`}
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 className="text-black font-semibold text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <p className="text-black w-[14rem] sm:w-[20rem] md:w-[22rem] text-xs sm:text-sm">
                      <Typewriter
                        text={item.content}
                        start={current === i}
                        speed={20}
                        ramp={180}
                        onDone={() => setCurrent((j) => (j === i ? i + 1 : j))}
                      />
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Boxes */}
          <motion.div
            className="w-full sm:w-[80%] md:w-[70%] lg:w-[40%] flex flex-wrap justify-center gap-4"
            variants={fadeUp}
            custom={0.4}
          >
            {loremContent.map((box, index) => (
              <motion.div
                key={index}
                className="w-[9rem] sm:w-[10rem] md:w-[12rem] flex justify-center shadow-[-3px_3px_0px_0px_rgb(0_0_0/0.8)] rounded-[1rem]"
                variants={fadeUp}
                custom={0.5 + index * 0.1}
              >
                <div
                  className={`text-center text-[#393a3c] flex flex-col justify-center items-center border-6 border-[#393a3c] rounded-[1rem] p-3 sm:p-4 ${box.color}`}
                >
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2">
                    {box.title}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base">
                    {box.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SectionB;
