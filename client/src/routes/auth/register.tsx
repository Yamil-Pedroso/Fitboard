import { createFileRoute, Navigate } from "@tanstack/react-router";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/context/UserContext";

export const Route = createFileRoute("/auth/register")({
  component: function RegisterComponent() {
    const { user } = useAuth();
    if (user) return <Navigate to="/" />;
    return <RegisterForm />;
  },
});
