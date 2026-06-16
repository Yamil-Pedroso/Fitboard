const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div
    className={`rounded-2xl border app-surface backdrop-blur-xl shadow-sm ${className}`}
  >
    {children}
  </div>
);

export default Card;
