import { useEffect, useRef } from "react";
import { ReactNode } from "react";

interface MenuItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const useOutsideClose = (open: boolean, onClose: () => void) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);
  return ref;
};

interface RoutineMenuProps {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
}

const RoutineMenu = ({ open, onClose, items }: RoutineMenuProps) => {
  const ref = useOutsideClose(open, onClose);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-lg"
    >
      {items.map((item: MenuItem, i: number) => (
        <button
          key={i}
          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black/5 text-neutral-900 cursor-pointer`}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.icon}
          <span
            className={`${item.danger ? "text-red-500" : "text-neutral-900"}`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default RoutineMenu;
