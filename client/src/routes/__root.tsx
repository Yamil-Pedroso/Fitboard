import { Outlet, createRootRoute } from "@tanstack/react-router";
import MainLayout from "@/layouts/MainLayout";
import { AuthProvider } from "@/context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </AuthProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  ),
});
