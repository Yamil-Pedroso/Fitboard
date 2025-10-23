import { createFileRoute } from "@tanstack/react-router";
import FAQs from "@/components/faqs/FAQs";

export const Route = createFileRoute("/faqs/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <FAQs />;
}
