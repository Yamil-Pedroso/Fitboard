import React, { useEffect, useMemo, useRef, useState } from "react";

export type LanguageCode = "en" | "es" | "de";

const LANGUAGES: {
  code: LanguageCode;
  label: string;
  native: string;
  flag: string;
}[] = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", native: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", native: "Deutsch", flag: "🇩🇪" },
];

const STORAGE_KEY = "app.lang";

function getBrowserLang(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const raw = (navigator?.language || navigator?.languages?.[0] || "en")
    .slice(0, 2)
    .toLowerCase();
  const set = new Set(LANGUAGES.map((l) => l.code));
  return set.has(raw as LanguageCode) ? (raw as LanguageCode) : "en";
}

function readStoredLang(): LanguageCode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v && ["en", "es", "de"].includes(v)) return v as LanguageCode;
  return null;
}

export type TranslateCompProps = {
  compact?: boolean; // icon-only button if true
  className?: string;
  onChange?: (lang: LanguageCode) => void; // plug your i18n here
};

const TranslateComp = ({
  compact = false,
  className = "",
  onChange,
}: TranslateCompProps) => {
  const [lang, setLang] = useState<LanguageCode>("en");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // initialize
  useEffect(() => {
    const stored = readStoredLang();
    const initial = stored ?? getBrowserLang();
    setLang(initial);
  }, []);

  // side effects on change
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
    }
    try {
      window?.localStorage?.setItem(STORAGE_KEY, lang);
    } catch {}
    try {
      window?.dispatchEvent?.(
        new CustomEvent("app:language-changed", { detail: { lang } })
      );
    } catch {}
    onChange?.(lang);
  }, [lang, onChange]);

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // keyboard: Ctrl/Cmd+L to cycle, Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator?.platform?.toLowerCase().includes("mac");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        cycle();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lang]);

  const cycle = () => {
    const idx = LANGUAGES.findIndex((l) => l.code === lang);
    const next = LANGUAGES[(idx + 1) % LANGUAGES.length].code;
    setLang(next);
  };

  const current = useMemo(
    () => LANGUAGES.find((l) => l.code === lang)!,
    [lang]
  );

  return (
    <div ref={ref} className={"relative inline-block " + className}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((o) => !o)}
        className={
          "group inline-flex items-center gap-2 rounded-full border border-gray-300  px-2 py-2 text-sm text-gray-900 shadow-sm transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-neutral-700 bg-[#393a3c] dark:text-neutral-100 " +
          (compact ? " h-9 w-9 justify-center p-0 " : " ")
        }
      >
        <GlobeIcon className="h-4 w-4 opacity-80 group-hover:opacity-100" />
        {!compact && (
          <>
            <span className="text-base leading-none">{current.flag}</span>
            <span className="font-medium">{current.label}</span>
            <ChevronDownIcon className="h-4 w-4 opacity-60" />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Language"
          className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded-xl border border-gray-200 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur transition dark:border-neutral-700 bg-[#393a3c]"
        >
          <div className="px-2 py-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-neutral-400">
            Language
          </div>
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              role="menuitem"
              onClick={() => {
                setLang(item.code);
                setOpen(false);
              }}
              className={
                "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 " +
                (lang === item.code ? "bg-gray-50 dark:bg-neutral-800" : "")
              }
            >
              <span className="text-xl leading-none">{item.flag}</span>
              <div className="flex-1 leading-tight">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs opacity-60">{item.native}</div>
              </div>
              {lang === item.code ? <CheckIcon className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20Z" />
    </svg>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default TranslateComp;
