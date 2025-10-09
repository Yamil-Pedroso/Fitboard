import { createFileRoute, Navigate } from "@tanstack/react-router";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/context/UserContext";

function LoginRouteComponent() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return <LoginForm />;
}

export const Route = createFileRoute("/auth/login")({
  component: LoginRouteComponent,
});
