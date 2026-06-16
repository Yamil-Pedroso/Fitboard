// ProfileReferencePhotos.tsx
import { useRef, useState, useEffect } from "react";
import { useProgress, useUploadReferencePhotos } from "@/lib/hooks/useProgress";

type RefWhich = "start" | "compare";

export default function ProfileReferencePhotos() {
  const { items } = useProgress({ page: 1, limit: 1, sort: "-date" });
  const latest = items?.[0];

  const startUrl = latest?.startPhoto?.url ?? "";
  const compareUrl = latest?.comparePhoto?.url ?? "";

  const [localStart, setLocalStart] = useState(startUrl);
  const [localCompare, setLocalCompare] = useState(compareUrl);

  useEffect(() => {
    setLocalStart(startUrl);
    setLocalCompare(compareUrl);
  }, [startUrl, compareUrl]);

  const { mutate: uploadRefs, isPending } = useUploadReferencePhotos();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [slot, setSlot] = useState<RefWhich | null>(null);

  const openPicker = (w: RefWhich) => {
    setSlot(w);
    fileRef.current?.click();
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !latest?._id || !slot) return;

    const payload: { id: string; start?: File; compare?: File } = {
      id: latest._id,
    };
    if (slot === "start") payload.start = f;
    else payload.compare = f;

    uploadRefs(payload, {
      onSuccess: () => {
        const r = new FileReader();
        r.onloadend = () => {
          const url = r.result as string;
          if (slot === "start") setLocalStart(url);
          else setLocalCompare(url);
        };
        r.readAsDataURL(f);
      },
    });

    setSlot(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section className="rounded-2xl border app-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Reference photos</h2>
        <span className="text-xs opacity-70">
          {isPending ? "Uploading…" : "Start • Compare"}
        </span>
      </div>

      <div className="flex gap-4">
        <RefTile
          label={localStart ? "Start" : "Start (add)"}
          src={localStart || "https://placehold.co/240x320?text=Start"}
          onClick={() => !isPending && openPicker("start")}
          disabled={isPending}
        />
        <RefTile
          label={localCompare ? "Compare" : "Compare (add)"}
          src={localCompare || "https://placehold.co/240x320?text=Compare"}
          onClick={() => !isPending && openPicker("compare")}
          disabled={isPending}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
    </section>
  );
}

function RefTile({
  label,
  src,
  onClick,
  disabled,
}: {
  label: string;
  src: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative w-[160px] overflow-hidden rounded-xl border app-surface text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-lime-400/30"
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      title={label}
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-[var(--app-surface-muted)]">
        <img src={src} alt={label} className="h-full w-full object-cover" />
      </div>
      <div className="border-t app-border p-2">
        <span className="text-xs opacity-70">{label}</span>
      </div>
    </button>
  );
}
