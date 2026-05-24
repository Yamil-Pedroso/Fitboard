import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, SendHorizonal, X, Dumbbell } from "lucide-react";

const hardcodedResponses = [
  "💪 You are doing great today. Your macro balance looks solid.",
  "🥗 Consider increasing protein intake after your next workout.",
  "🔥 Your weekly consistency is improving. Keep going!",
  "🏋️ You may benefit from adding another leg session this week.",
  "😴 Recovery matters too — remember to rest properly.",
];

export default function FitboardCoach() {
  const [open, setOpen] = useState(false);

  const coachRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "✨ Hi! I’m your Fitboard AI Coach. Ask me about meals, routines or progress.",
    },
  ]);

  const [input, setInput] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target)) {
        return;
      }

      if (coachRef.current && !coachRef.current.contains(target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  function handleSendMessage() {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    const randomResponse =
      hardcodedResponses[Math.floor(Math.random() * hardcodedResponses.length)];

    const aiMessage = {
      role: "assistant",
      content: randomResponse,
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);

    setInput("");
  }

  return (
    <>
      <motion.button
        ref={buttonRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 18,
        }}
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 left-4 z-[999] flex items-center gap-3 rounded-2xl border-4 border-gray-800 bg-lime-400 px-4 py-3 text-black sm:bottom-5 sm:left-5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-lime-400">
          <Bot className="h-5 w-5" />
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-black leading-none">Fitboard Coach</p>

          <p className="mt-1 text-xs font-medium opacity-70">
            AI fitness assistant ✨
          </p>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={coachRef}
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -30, y: 10 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              fixed z-[999] flex flex-col overflow-hidden overscroll-contain
              rounded-[2rem] border-6 border-gray-800 shadow-sm bg-[#fffef8]
              bottom-20 left-3 right-3 h-[78vh]
              sm:bottom-24 sm:left-5 sm:right-auto
              sm:h-[560px] sm:w-[360px]
            "
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-neutral-900 bg-lime-400 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-lime-400">
                  <Dumbbell className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-black text-black">
                    Fitboard Coach (Hardcoded)
                  </h2>

                  <p className="text-xs font-medium text-black/70">
                    AI Fitness Assistant
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-black p-2 text-lime-400 transition hover:scale-105"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={chatScrollRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#fffef8] p-4"
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "bg-black text-white"
                        : "border border-neutral-200 bg-white text-neutral-800"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-lime-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Coach
                      </div>
                    )}

                    {message.content}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about meals or routines..."
                  className="flex-1 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-black outline-none transition focus:border-lime-400"
                />

                <button
                  onClick={handleSendMessage}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-black transition hover:scale-105"
                >
                  <SendHorizonal className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
