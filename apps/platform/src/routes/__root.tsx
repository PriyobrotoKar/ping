import { Toaster } from "@/components/ui/sonner";
import AuthContextProvider from "@/providers/AuthProvider";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <ReactQueryProvider>
        <ThemeProvider>
          <AuthContextProvider>
            <Outlet />
            <Toaster richColors />
          </AuthContextProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </>
  ),
});
