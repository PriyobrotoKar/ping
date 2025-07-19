import { useAuth } from "@/providers/AuthProvider";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = useAuth();

  console.log("DashboardLayout", auth);

  if (!auth) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
