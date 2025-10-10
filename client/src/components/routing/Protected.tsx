import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/UserContext";

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/auth/login" />;
  return <>{children}</>;
};

export default Protected;
