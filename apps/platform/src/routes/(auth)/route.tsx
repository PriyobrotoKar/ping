import { useAuth } from "@/providers/AuthProvider";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = useAuth();

  console.log("AuthLayout", auth);

  if (auth) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}
