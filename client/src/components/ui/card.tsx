const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div
    className={`rounded-2xl border border-black/10 bg-white/70 backdrop-blur-xl shadow-sm text-black ${className}`}
  >
    {children}
  </div>
);

export default Card;
