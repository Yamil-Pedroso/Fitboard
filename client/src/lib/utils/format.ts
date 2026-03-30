const fmtDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(iso),
      )
    : "—";

const fmtDuration = (min?: number) => {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m} min`;
};

export { fmtDate, fmtDuration };
