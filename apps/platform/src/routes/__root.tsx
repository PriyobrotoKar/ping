import { Toaster } from "@/components/ui/sonner";
import AuthContextProvider from "@/providers/AuthProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <ReactQueryProvider>
        <AuthContextProvider>
          <Outlet />
          <Toaster richColors />
        </AuthContextProvider>
      </ReactQueryProvider>
      <TanStackRouterDevtools />
    </>
  ),
});
