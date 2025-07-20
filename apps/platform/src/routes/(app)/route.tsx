import ChatSidebar from "@/components/ChatSidebar";
import { useAuth } from "@/providers/AuthProvider";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = useAuth();

  if (!auth) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="h-svh flex ">
      <ChatSidebar />
      <Outlet />
    </div>
  );
}
