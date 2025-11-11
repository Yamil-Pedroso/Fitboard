import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaDumbbell } from "react-icons/fa";

interface DevModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

export const DevelopmentModal = ({
  isModalOpen,
  setIsModalOpen,
}: DevModalProps) => {
  useEffect(() => {
    // Optional: prevent background scroll when modal is open
    if (isModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isModalOpen]);

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Dark background layer */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          />

          {/* Centered Modal */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2
                       bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.8, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="text-5xl text-green-600 mb-3">
              <FaDumbbell />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Fitness & Nutrition App
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              This website is currently under development. Many features are
              already functional, and you can explore around, but some parts may
              still be limited or in progress. Stay tuned — new updates are
              coming soon!
            </p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-2 px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              Got it!
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
