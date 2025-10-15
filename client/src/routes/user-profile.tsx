import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/components/profile/Profile";

export const Route = createFileRoute("/user-profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Profile />;
}
