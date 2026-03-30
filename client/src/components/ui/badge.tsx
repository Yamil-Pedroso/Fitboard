import * as React from "react";
const Badge: React.FC<
  React.PropsWithChildren<{ variant?: "outline" | "solid" }>
> = ({ children, variant = "solid" }) => (
  <span
    className={
      variant === "outline"
        ? "inline-flex items-center rounded border border-black/20 px-1.5 py-0.5 text-[10px]"
        : "inline-flex items-center rounded bg-black/10 px-1.5 py-0.5 text-[10px]"
    }
  >
    {children}
  </span>
);

export default Badge;
