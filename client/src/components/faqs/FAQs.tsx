import React, { useMemo, useRef, useState, useEffect } from "react";

// --- Fake data (hardcoded) ---------------------------------------------------
// Tip: later you'll move this to i18n or your backend.
export type FaqItem = {
  id: string;
  category: "General" | "Account" | "Billing" | "Technical";
  q: string;
  a: string;
};

const FAQS_DATA: FaqItem[] = [
  {
    id: "g1",
    category: "General",
    q: "What is this platform and who is it for?",
    a: "It’s a web app designed for creators and small teams. It helps you organize content, projects, and automations without friction.",
  },
  {
    id: "g2",
    category: "General",
    q: "Do you have a free plan?",
    a: "Yes, the Free plan includes the essentials to get started. You can upgrade to Pro when you need higher limits or advanced features.",
  },
  {
    id: "c1",
    category: "Account",
    q: "How do I switch the language to English or German?",
    a: "Use the language switcher in the Navbar. Your preference is saved and the interface updates instantly.",
  },
  {
    id: "c2",
    category: "Account",
    q: "Can I invite my team?",
    a: "Absolutely. In Settings → Team you can invite members by email, assign roles, and manage permissions.",
  },
  {
    id: "p1",
    category: "Billing",
    q: "What payment methods do you accept?",
    a: "Visa, MasterCard, and Amex. For annual invoicing via bank transfer, contact us.",
  },
  {
    id: "p2",
    category: "Billing",
    q: "Do you offer refunds?",
    a: "We offer a refund within 14 days after purchase if the product doesn’t fit your needs.",
  },
  {
    id: "t1",
    category: "Technical",
    q: "Do you have a public API?",
    a: "Yes, we provide a REST API. Documentation is available at /developers with examples and SDKs.",
  },
  {
    id: "t2",
    category: "Technical",
    q: "How do I report a bug?",
    a: "From the Help menu → Report a bug, or email support with screenshots and reproduction steps.",
  },
];

const CATEGORIES: Array<FaqItem["category"] | "All"> = [
  "All",
  "General",
  "Account",
  "Billing",
  "Technical",
];

// --- Helpers -----------------------------------------------------------------
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// Smooth height animation for accordion
function useAutoHeight(isOpen: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = isOpen ? el.scrollHeight : 0;
    setHeight(next);
  }, [isOpen]);

  return { ref, height } as const;
}

// --- Components --------------------------------------------------------------

type AccordionItemProps = {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
};

function AccordionItem({ item, open, onToggle }: AccordionItemProps) {
  const { ref, height } = useAutoHeight(open);
  const panelId = `faq-panel-${item.id}`;
  const buttonId = `faq-button-${item.id}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm transition hover:shadow dark:border-neutral-700 dark:bg-neutral-900/70">
      <button
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="group flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-neutral-100">
            {item.q}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {open ? "Click to collapse" : "Click to view the answer"}
          </p>
        </div>
        <ChevronIcon
          className={classNames(
            "mt-1 h-5 w-5 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        style={{ height }}
        className="grid overflow-hidden transition-[height] duration-300 ease-in-out"
      >
        <div
          ref={ref}
          className="pt-3 text-sm leading-6 text-gray-700 dark:text-neutral-200"
        >
          {item.a}
        </div>
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
        active
          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-400/10 "
          : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-800 dark:hover:bg-neutral-800"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </button>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search questions…"
        className="w-full rounded-xl border border-gray-300 bg-white/70 px-10 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-100"
      />
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-60" />
      {value && (
        <button
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          Clear
        </button>
      )}
    </div>
  );
}

// --- Page component ----------------------------------------------------------

const FAQs: React.FC = () => {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<(typeof CATEGORIES)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(FAQS_DATA[0]?.id ?? null);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return FAQS_DATA.filter((item) => {
      const inCat = selected === "All" || item.category === selected;
      const inText =
        !text ||
        item.q.toLowerCase().includes(text) ||
        item.a.toLowerCase().includes(text);
      return inCat && inText;
    });
  }, [q, selected]);

  useEffect(() => {
    // If the open item is filtered out, close it
    if (openId && !filtered.some((i) => i.id === openId)) setOpenId(null);
  }, [filtered, openId]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10">
          <SparkleIcon className="h-4 w-4" />
          FAQs
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-neutral-50 sm:text-4xl">
          Have questions? Here are the answers
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600 ">
          Explore the most common questions about the platform. If you can’t
          find what you need, contact us.
        </p>
      </div>

      {/* Search + Categories */}
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <SearchInput value={q} onChange={setQ} />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={selected === cat}
              onClick={() => setSelected(cat)}
            />
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
            No results for <span className="font-medium">“{q}”</span>. Try
            different keywords or change the category.
          </div>
        ) : (
          filtered.map((item) => (
            <AccordionItem
              key={item.id}
              item={item}
              open={openId === item.id}
              onToggle={() =>
                setOpenId((id) => (id === item.id ? null : item.id))
              }
            />
          ))
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-10 flex items-center justify-between rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-blue-50/60 p-5 dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">
            Still need help?
          </p>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Write to us and we’ll reply in under 24 hours.
          </p>
        </div>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border border-blue-500 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-blue-500"
        >
          Contact support
        </a>
      </div>
    </section>
  );
};

export default FAQs;

// --- Icons (inline, no dependencies) ----------------------------------------
function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3l1.6 3.9L18 8.5l-3.6 1.6L12 14l-1.6-3.9L6 8.5l3.6-1.6L12 3z" />
      <path d="M5 17l.8 2 .8-2 .8-2 .8 2 .8 2 .8-2" opacity=".6" />
    </svg>
  );
}
