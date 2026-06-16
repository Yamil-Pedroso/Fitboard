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
  ChevronDown,
  Download,
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

type DownloadFormat = "pdf" | "csv" | "md" | "txt" | "json" | "html";

const DOWNLOAD_FORMATS: { label: string; value: DownloadFormat }[] = [
  { label: "PDF", value: "pdf" },
  { label: "CSV", value: "csv" },
  { label: "Markdown", value: "md" },
  { label: "Text", value: "txt" },
  { label: "JSON", value: "json" },
  { label: "HTML", value: "html" },
];

function sanitizeFileName(value: string) {
  const clean = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 42);

  return clean || "fitboard-coach-response";
}

function quoteCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapPdfLine(line: string, maxLength = 88) {
  const words = line.replace(/\s+/g, " ").trim().split(" ");
  const wrapped: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      wrapped.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) wrapped.push(current);
  return wrapped.length ? wrapped : [""];
}

function toPdfHexText(value: string) {
  const bytes = [0xfe, 0xff];

  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    bytes.push((code >> 8) & 0xff, code & 0xff);
  }

  return `<${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}>`;
}

function makePdfBlob(content: string) {
  const lines = content
    .split("\n")
    .flatMap((line) => wrapPdfLine(line))
    .slice(0, 360);
  const pages: string[][] = [];
  const linesPerPage = 46;

  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }

  if (pages.length === 0) pages.push([""]);

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");

  const pageObjectIds = pages.map((_page, index) => 3 + index * 2);
  objects.push(
    `<< /Type /Pages /Kids [${pageObjectIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pages.length} >>`,
  );

  pages.forEach((page, index) => {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    const stream = [
      "BT",
      "/F1 11 Tf",
      "50 790 Td",
      "14 TL",
      ...page.map((line) => `${toPdfHexText(line)} Tj T*`),
      "ET",
    ].join("\n");

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentId} 0 R >>`,
    );
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function makeDownloadBlob(content: string, format: DownloadFormat) {
  switch (format) {
    case "pdf":
      return makePdfBlob(content);
    case "csv": {
      const rows = content
        .split("\n")
        .map((line, index) => `${index + 1},${quoteCsv(line)}`)
        .join("\n");
      return new Blob([`line,response\n${rows}`], {
        type: "text/csv;charset=utf-8",
      });
    }
    case "json":
      return new Blob(
        [
          JSON.stringify(
            {
              source: "Fitboard Coach",
              exportedAt: new Date().toISOString(),
              response: content,
            },
            null,
            2,
          ),
        ],
        { type: "application/json;charset=utf-8" },
      );
    case "html":
      return new Blob(
        [
          `<!doctype html><html><head><meta charset="utf-8"><title>Fitboard Coach Response</title><style>body{font-family:Arial,sans-serif;line-height:1.6;max-width:760px;margin:40px auto;padding:0 20px;color:#111}pre{white-space:pre-wrap}</style></head><body><h1>Fitboard Coach Response</h1><pre>${escapeHtml(
            content,
          )}</pre></body></html>`,
        ],
        { type: "text/html;charset=utf-8" },
      );
    case "md":
      return new Blob([`# Fitboard Coach Response\n\n${content}\n`], {
        type: "text/markdown;charset=utf-8",
      });
    case "txt":
    default:
      return new Blob([content], { type: "text/plain;charset=utf-8" });
  }
}

function downloadResponse(content: string, format: DownloadFormat) {
  const blob = makeDownloadBlob(content, format);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFileName(content)}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function ResponseDownloadMenu({ content }: { content: string }) {
  return (
    <details className="group relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-1 rounded-full border border-lime-200 bg-lime-50 px-2 py-1 text-[10px] font-black text-lime-800 transition hover:border-lime-400 hover:bg-lime-100 [&::-webkit-details-marker]:hidden"
        aria-label="Download response"
      >
        <Download className="h-3 w-3" />
        <span>Export</span>
        <ChevronDown className="h-3 w-3 transition group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-xl border app-surface-strong py-1 text-xs shadow-xl">
        {DOWNLOAD_FORMATS.map((format) => (
          <button
            key={format.value}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              downloadResponse(content, format.value);
            }}
            className="flex w-full items-center justify-between px-3 py-2 text-left font-bold transition hover:bg-[var(--app-surface-muted)]"
          >
            {format.label}
          </button>
        ))}
      </div>
    </details>
  );
}

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-black app-text">
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
    <div className="space-y-2.5 font-medium leading-relaxed">
      {lines.map((line, index) => {
        const bullet = line.match(/^[-*•]\s+(.+)/);
        const numbered = line.match(/^\d+[.)]\s+(.+)/);
        const heading = line.match(/^#{1,4}\s+(.+)/);

        if (heading) {
          return (
            <p
              key={`${line}-${index}`}
              className="pt-1 text-[13px] font-black uppercase"
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
              rounded-[2rem] border-6 border-gray-800 shadow-sm app-surface-strong
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
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[var(--app-bg-soft)] p-4"
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
                        : "border app-surface shadow-sm ring-1 ring-lime-100/70"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="mb-3 flex items-center justify-between gap-2 border-b border-lime-100 pb-2 text-xs font-black uppercase text-lime-700">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-100 text-lime-700">
                            {message.icon ?? (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <span className="truncate">{t("assistantLabel")}</span>
                        </div>

                        <ResponseDownloadMenu content={message.content} />
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
                      className="rounded-full border border-lime-300 bg-lime-50 px-3 py-2 text-left text-xs font-bold text-black transition hover:border-lime-500 hover:bg-lime-100 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <div className="max-w-[85%] rounded-2xl border app-surface px-4 py-3 text-sm shadow-sm ring-1 ring-lime-100/70">
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

            <div className="border-t app-border bg-[var(--app-surface-strong)] p-4">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSendMessage();
                  }}
                  placeholder={t("placeholder")}
                  disabled={sendCoachMessage.isPending}
                  className="flex-1 rounded-2xl border-2 px-4 py-3 text-sm app-control"
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
