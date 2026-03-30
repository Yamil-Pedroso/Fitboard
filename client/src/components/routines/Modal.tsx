import * as React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-40">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-xl text-black">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="text-sm">{children}</div>

          <div className="mt-4 flex justify-end gap-2">{footer}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Modal;
