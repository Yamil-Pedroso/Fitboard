import * as React from "react";

const Chip: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs text-white">
    {children}
  </span>
);

export default Chip;
