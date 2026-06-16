import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";

import "@/i18/i18";

import { routeTree } from "./routeTree.gen";

const storedTheme = localStorage.getItem("fitboard-theme");
document.documentElement.dataset.theme =
  storedTheme === "dark" ? "dark" : "light";

const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
