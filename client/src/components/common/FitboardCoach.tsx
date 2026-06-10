import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import {
  Bot,
  Sparkles,
  SendHorizonal,
  X,
  Dumbbell,
} from "lucide-react";
import { useSendCoachMessage } from "@/lib/hooks/useCoach";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  icon: ReactNode | null;
};

type CoachApiError = {
  error?: string;
};

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-black text-neutral-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function CoachResponse({ content }: { content: string }) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <div className="space-y-2.5 font-medium leading-relaxed text-neutral-800">
      {lines.map((line, index) => {
        const bullet = line.match(/^[-*•]\s+(.+)/);
        const numbered = line.match(/^\d+[.)]\s+(.+)/);
        const heading = line.match(/^#{1,4}\s+(.+)/);

        if (heading) {
          return (
            <p
              key={`${line}-${index}`}
              className="pt-1 text-[13px] font-black uppercase text-neutral-950"
            >
              {renderInlineText(heading[1])}
            </p>
          );
        }

        if (bullet || numbered) {
          return (
            <div key={`${line}-${index}`} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400 ring-2 ring-lime-100" />
              <p className="min-w-0 flex-1">
                {renderInlineText((bullet ?? numbered)?.[1] ?? line)}
              </p>
            </div>
          );
        }

        return <p key={`${line}-${index}`}>{renderInlineText(line)}</p>;
      })}
    </div>
  );
}

const QUICK_PROMPTS = [
  "Analyze my progress this week",
  "What should I eat for dinner today?",
  "Help me hit my macros",
  "Give me a quick workout",
  "How can I improve my sleep?",
  "Which habit should I prioritize?",
];

const DEFAULT_CHAT_WIDTH = 360;
const MIN_CHAT_WIDTH = 320;
const EDGE_GAP = 12;

export default function FitboardCoach() {
  const { t } = useTranslation("chatAi");

  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sendCoachMessage = useSendCoachMessage();

  const coachRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: t("initialMessage"),
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
  ]);

  const [input, setInput] = useState("");

  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1
        ? [
            {
              role: "assistant",
              content: t("initialMessage"),
              icon: <Sparkles className="h-3.5 w-3.5" />,
            },
          ]
        : prev,
    );
  }, [t]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (buttonRef.current?.contains(target)) return;

      if (coachRef.current && !coachRef.current.contains(target)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", handleClickOutside);

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

  useEffect(() => {
    if (!isResizing) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    function handleMouseMove(event: MouseEvent) {
      const left = coachRef.current?.getBoundingClientRect().left ?? 0;
      const maxWidth = Math.max(
        MIN_CHAT_WIDTH,
        window.innerWidth - left - EDGE_GAP,
      );
      const nextWidth = Math.min(
        Math.max(event.clientX - left, MIN_CHAT_WIDTH),
        maxWidth,
      );

      setChatWidth(nextWidth);
    }

    function handleMouseUp() {
      setIsResizing(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const showQuickPrompts =
    messages.length === 1 && messages[0]?.role === "assistant";

  const coachStyle = {
    "--fitboard-coach-width": `${chatWidth}px`,
  } as CSSProperties;

  async function handleSendMessage(messageOverride?: string) {
    const nextInput = (messageOverride ?? input).trim();
    if (!nextInput || sendCoachMessage.isPending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: nextInput,
      icon: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageOverride) setInput("");

    try {
      const response = await sendCoachMessage.mutateAsync({
        message: nextInput,
        conversationId,
      });

      setConversationId(response.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message.content,
          icon: <Sparkles className="h-3.5 w-3.5" />,
        },
      ]);
    } catch (error) {
      const apiError =
        error instanceof AxiosError
          ? (error as AxiosError<CoachApiError>)
          : null;
      const fallback =
        apiError?.response?.data?.error ??
        (apiError?.response?.status === 401
          ? "Please log in to talk with Fitboard Coach."
          : "I could not connect with Fitboard Coach right now.");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallback,
          icon: <Sparkles className="h-3.5 w-3.5" />,
        },
      ]);
    }
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

        <div className="hidden cursor-pointer text-left sm:block">
          <p className="text-sm font-black leading-none">{t("buttonTitle")}</p>

          <p className="mt-1 text-xs font-medium opacity-70">
            {t("buttonSubtitle")}
          </p>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={coachRef}
            style={coachStyle}
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
              sm:h-[560px] sm:w-[var(--fitboard-coach-width)]
            "
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <div
              aria-hidden="true"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsResizing(true);
              }}
              className={`absolute bottom-6 right-0 top-6 z-10 hidden w-3 cursor-ew-resize rounded-r-[2rem] transition sm:block ${
                isResizing
                  ? "bg-lime-400/30"
                  : "bg-transparent hover:bg-lime-400/20"
              }`}
            />

            <div className="flex items-center justify-between border-b-2 border-neutral-900 bg-lime-400 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-lime-400">
                  <Dumbbell className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-black text-black">{t("headerTitle")}</h2>

                  <p className="text-xs font-medium text-black/70">
                    {t("headerSubtitle")}
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
                        : "border border-lime-200/80 bg-white shadow-sm ring-1 ring-lime-100/70"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-3 flex items-center gap-2 border-b border-lime-100 pb-2 text-xs font-black uppercase text-lime-700">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-100 text-lime-700">
                          {message.icon ?? (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span>{t("assistantLabel")}</span>
                      </div>
                    )}

                    {message.role === "assistant" ? (
                      <CoachResponse content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}

              {showQuickPrompts && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="flex flex-wrap gap-2"
                >
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      disabled={sendCoachMessage.isPending}
                      className="rounded-full border border-lime-300 bg-lime-50 px-3 py-2 text-left text-xs font-bold text-neutral-800 transition hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {prompt}
                    </button>
                  ))}
                </motion.div>
              )}

              {sendCoachMessage.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] rounded-2xl border border-lime-200/80 bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm ring-1 ring-lime-100/70">
                    <div className="mb-3 flex items-center gap-2 border-b border-lime-100 pb-2 text-xs font-black uppercase text-lime-700">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-100 text-lime-700">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      <span>{t("assistantLabel")}</span>
                    </div>

                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-lime-500" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-lime-500 [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-lime-500 [animation-delay:240ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="border-t border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSendMessage();
                  }}
                  placeholder={t("placeholder")}
                  disabled={sendCoachMessage.isPending}
                  className="flex-1 rounded-2xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-black outline-none transition focus:border-lime-400"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={sendCoachMessage.isPending || !input.trim()}
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
