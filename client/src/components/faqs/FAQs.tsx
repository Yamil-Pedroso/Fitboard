import React, { useMemo, useRef, useState, useEffect } from "react";

// --- Fake data (hardcoded) ---------------------------------------------------
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

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

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

type AccordionItemProps = {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
};

function AccordionItem({ item, open, onToggle }: AccordionItemProps) {
  const { ref, height } = useAutoHeight(open);

  return (
    <div className="rounded-2xl border app-surface backdrop-blur p-4 shadow-sm transition hover:shadow-md">
      <button
        onClick={onToggle}
        className="group flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <h3 className="text-base font-semibold app-text">{item.q}</h3>
          <p className="mt-1 text-sm app-muted">
            {open ? "Click to collapse" : "Click to view the answer"}
          </p>
        </div>
        <ChevronIcon
          className={classNames(
            "mt-1 h-5 w-5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        style={{ height }}
        className="grid overflow-hidden transition-[height] duration-300 ease-in-out"
      >
        <div ref={ref} className="pt-3 text-sm app-muted">
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
          ? "border-lime-400 bg-lime-100 text-black shadow-sm"
          : "app-secondary-action app-muted",
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
        className="w-full rounded-xl border px-10 py-2.5 text-sm app-control shadow-sm"
      />
      <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 opacity-60" />
    </div>
  );
}

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

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border app-surface backdrop-blur px-3 py-1 text-xs app-muted">
          <SparkleIcon className="h-4 w-4 text-lime-500" />
          FAQs
        </div>

        <h1 className="text-3xl font-bold app-text sm:text-4xl">
          Have questions? Here are the answers
        </h1>

        <p className="mx-auto mt-3 max-w-2xl app-muted">
          Explore the most common questions about the platform. If you can’t
          find what you need, contact us.
        </p>
      </div>

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

      <div className="space-y-3">
        {filtered.map((item) => (
          <AccordionItem
            key={item.id}
            item={item}
            open={openId === item.id}
            onToggle={() =>
              setOpenId((id) => (id === item.id ? null : item.id))
            }
          />
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-2xl border app-surface p-5">
        <div>
          <p className="text-sm font-medium app-text">
            Still need help?
          </p>
          <p className="text-sm app-muted">
            Write to us and we’ll reply in under 24 hours.
          </p>
        </div>
        <a
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border border-lime-400 bg-lime-400 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-lime-300"
        >
          Contact support
        </a>
      </div>
    </section>
  );
};

export default FAQs;

// Icons
function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M12 3l1.6 3.9L18 8.5l-3.6 1.6L12 14l-1.6-3.9L6 8.5l3.6-1.6L12 3z" />
    </svg>
  );
}
