interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  setShow: (show: boolean) => void;
}

export function PasswordInput({
  label,
  value,
  onChange,
  show,
  setShow,
}: PasswordInputProps) {
  return (
    <div className="mt-4 space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <div className="relative">
        <input
          className="w-full rounded-xl border border-neutral-200
                       bg-white/80 backdrop-blur
                       px-3 py-2.5 pr-12 text-sm outline-none transition
                       focus:ring-2 focus:ring-lime-400/30"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder="••••••••"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-black"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
