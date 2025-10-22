import React, { useEffect, useRef, useState } from "react";

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
  speed = 18, // ms por carácter
  ramp = 140, // ms de "fade-in" inicial antes de comenzar
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

  // reduced motion: escribe instantáneo
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches && start) {
      setVisible(true);
      setIdx(text.length);
      onDone?.();
    }
  }, [start, text.length, onDone]);

  // pequeña rampa de entrada (suaviza el inicio)
  useEffect(() => {
    if (!start) return;
    const id = window.setTimeout(() => setVisible(true), ramp);
    return () => window.clearTimeout(id);
  }, [start, ramp]);

  // escritura carácter por carácter
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

/* ================= Componente principal ================= */
const SectionB = () => {
  const { ref: smallRef, inView } = useInViewOnce<HTMLDivElement>();
  // Controla qué índice está escribiéndose (secuencial de arriba hacia abajo)
  const [current, setCurrent] = useState(-1);

  // Cuando entra en viewport, comienza el primero
  useEffect(() => {
    if (inView && current === -1) setCurrent(0);
  }, [inView, current]);

  return (
    <div className="w-full flex flex-col  justify-center ">
      <h2 className="text-black mt-10 text-4xl font-bold">Section B</h2>
      <p className="text-black">This is the content for Section B.</p>

      <div className="w-full flex mt-10 gap-3.5">
        {/* Small Circles con escritura secuencial */}
        <div
          ref={smallRef}
          className="w-[58%] shadow-[-3px_3px_0px_0px_rgb(0_0_0/0.8)]"
        >
          <div className="h-[25rem] bg-white p-6 shadow-lg border-6 border-[#393a3c] overflow-hidden relative">
            {smallCircle.map((item, i) => (
              <div
                key={i}
                className={`flex gap-8 mb-4 absolute mt-8`}
                style={{ top: i * 80, left: 20 }}
              >
                <div className="mt-2">
                  <div
                    className={`w-3 h-3 ${item.color} flex rounded-full border-2 border-gray-600`}
                  />
                </div>
                <div className="flex flex-col ">
                  <h3 className="text-black font-semibold">{item.title}</h3>
                  <p className="text-black w-[22rem]">
                    <Typewriter
                      text={item.content}
                      start={current === i} // SOLO este ítem escribe
                      speed={20} // más suave
                      ramp={180} // pequeña rampa
                      onDone={() => setCurrent((i) => (i === i ? i + 1 : i))}
                    />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Large Boxes (sin cambios) */}
        <div className="w-[40%] flex gap-4">
          {loremContent.map((box, index) => (
            <div
              key={index}
              className="w-[10rem] flex justify-center shadow-[-3px_3px_0px_0px_rgb(0_0_0/0.8)]"
            >
              <div
                className={`w-2xl text-center text-[#393a3c] flex flex-col justify-center items-center border-6 border-[#393a3c] p-4 ${box.color}`}
              >
                <h2 className="text-xl font-semibold mb-2">{box.title}</h2>
                <p>{box.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionB;
