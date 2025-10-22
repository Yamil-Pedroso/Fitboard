import { useState, useEffect } from "react";
import assets from "@/assets";
import { motion, type Variants } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { PiMouseLeftClickFill } from "react-icons/pi";
import { FaCheck } from "react-icons/fa6";

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 16 },
  },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 90, damping: 16 },
  },
};

const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const SectionD = () => {
  const [click, setClick] = useState(false);
  const [checked, setChecked] = useState(false);
  const [box, setBox] = useState<string[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [openedByClick, setOpenedByClick] = useState(false);

  const msg = "Super! You unblocked the secret content!";
  const LS_KEY = "unlocked";

  // Cargar estado inicial desde localStorage (SSR-safe)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setIsUnlocked(true);
        setChecked(true); // ya no se puede desmarcar
        setBox([saved]); // muestra el mensaje guardado
        //setClick(true); // opcional, abre el popup
      }
    } catch {
      // si localStorage falla, ignora silenciosamente
    }
  }, []);

  useEffect(() => {
    if (click && checked && box.length > 0 && openedByClick) {
      const timer = setTimeout(() => {
        setClick(false); // oculta el cartel
        setOpenedByClick(false); // resetea el flag
      }, 10_000);
      return () => clearTimeout(timer);
    }
  }, [click, checked, box.length, openedByClick]);

  // Si ya está desbloqueado, no permitir "uncheck"
  const handleCheck = () => {
    if (isUnlocked) return;
    setChecked((prev) => !prev);
  };

  const handleClick = () => {
    // si no está checkeado o ya está desbloqueado, no hace nada
    if (!checked || isUnlocked) return;

    setClick(true); // no lo “toggles”, lo pones explícitamente en true
    setOpenedByClick(true);

    try {
      localStorage.setItem(LS_KEY, msg);
    } catch {}
    if (box.length === 0) setBox([msg]);

    setIsUnlocked(true); // puedes dejar esto, ya no rompe el timeout
    setChecked(true);
  };

  // botón deshabilitado si: no checkeado O ya desbloqueado
  const disabledBtn = !checked || isUnlocked;

  return (
    <motion.div
      className="w-full flex flex-col justify-center mt-30"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="w-full flex justify-center flex-col gap-10 lg:flex-row lg:justify-between lg:gap-12">
        <motion.div className="w-full lg:w-[50rem]" variants={fadeRight}>
          <h1 className="text-black text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Experience Reliable Fitness Services
          </h1>
        </motion.div>

        <motion.div
          className="w-full lg:w-[50rem] flex flex-col gap-6"
          variants={fadeUp}
        >
          <p className="text-black max-w-[30rem]">
            Our platform offers dependable fitness services designed to help you
            achieve your health goals. Here's what we provide: <br />
            <span className="font-medium">Flexible Scheduling:</span> Book
            sessions at your convenience. <br />
            <span className="font-medium">Expert Trainers:</span> Work with
            certified professionals. <br />
            <span className="font-medium">Personalized Plans:</span> Tailored
            workouts to fit your needs. <br />
            <span className="font-medium">Progress Tracking:</span> Monitor your
            improvements over time.
          </p>

          <motion.div className="flex gap-3" variants={fadeUp}>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-black px-4 py-2 rounded border-4 bg-amber-400"
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gray-300 text-black px-4 py-2 rounded border-4"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Imagen con zoom-in */}
      <div className="flex gap-20">
        <div className="relative">
          <div className="flex justify-center items-center w-[5rem] h-[5rem] shadow-2xl absolute bg-amber-400 z-50">
            <FaEye className="text-3xl text-black" />
          </div>

          <motion.div
            className="w-[39rem] h-[30rem] overflow-hidden border-6 border-[#393a3c] mt-12"
            variants={zoomIn}
          >
            <img
              src={assets.section1}
              alt="Routines"
              className="w-full h-full shadow-lg object-cover"
            />
          </motion.div>
        </div>

        <div className="mt-10">
          <div>
            <h2 className="text-black text-3xl font-bold mt-8">Take Action</h2>
            <p className="text-black mt-6 max-w-2xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
          </div>

          <div className="flex mt-6">
            <div>
              <img src={assets.noteBook} alt="notebook" className="w-48 mt-6" />
            </div>

            <div className="ml-6 flex flex-col justify-end relative">
              {/* Checkbox + label */}
              <div className="flex items-center mb-6">
                <div
                  onClick={handleCheck}
                  className={`flex justify-center items-center w-[4rem] h-[2rem] border border-[#393a3c] ${
                    isUnlocked
                      ? "cursor-not-allowed opacity-80"
                      : "cursor-pointer"
                  }`}
                >
                  {checked && <FaCheck className="text-green-600 text-2xl" />}
                </div>
                <div>
                  <p className="text-black ml-2">
                    Do you want to unlock the secret content?
                  </p>
                </div>
              </div>

              {/* Botón mouse con tooltip cuando está deshabilitado por desbloqueo */}
              <div className="relative group w-fit">
                <button
                  onClick={handleClick}
                  disabled={disabledBtn}
                  className={`flex justify-center items-center w-[4rem] h-[4rem] rounded-full shadow-2xl border-3
                    ${disabledBtn ? "bg-gray-300 cursor-not-allowed opacity-70 border-gray-300" : "bg-gray-200 cursor-pointer border-[#393a3c]"}
                  `}
                  // Fallback nativo:
                  title={isUnlocked ? "This content is already unlocked." : ""}
                >
                  <PiMouseLeftClickFill className="text-4xl text-[#393a3c]" />
                </button>

                {/* Tooltip custom (aparece solo si está desbloqueado) */}
                {isUnlocked && (
                  <div
                    className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity
                               absolute left-1/2 -translate-x-1/2 top-[110%] whitespace-nowrap
                               bg-black text-white text-xs px-3 py-1 rounded"
                  >
                    This content is already unlocked.
                  </div>
                )}
              </div>

              {/* Popup con el contenido */}
              {click && checked && box.length > 0 && (
                <div className="p-6 border-4 border-[#393a3c] rounded-lg top-[2rem] left-8 absolute bg-white">
                  <p className="text-[#393a3c] font-bold w-[19rem]">{box[0]}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SectionD;
