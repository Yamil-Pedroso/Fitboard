interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
export function Input({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: InputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="w-full rounded-xl border px-3 py-2.5 text-sm app-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
      />
    </div>
  );
}
