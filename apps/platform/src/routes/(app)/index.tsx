import Logo from "@/components/Logo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/")({
  component: App,
});

function App() {
  return (
    <div className="min-h-svh flex justify-center items-center flex-1">
      <div className="max-w-80 text-center space-y-4">
        <Logo
          className="mx-auto opacity-50"
          width={120}
          height={50}
          type="full"
        />
        <p className="text-sm text-muted-foreground">
          This is an empty chat screen. This will be shown when no chat is
          selected.
        </p>
      </div>
    </div>
  );
}
