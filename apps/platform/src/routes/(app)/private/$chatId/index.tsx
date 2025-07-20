import ChatHeader from "@/components/ChatHeader";
import ChatScreen from "@/components/ChatScreen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/private/$chatId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const chatId = Route.useParams().chatId;
  const [myId, otherId] = chatId.split("-");

  if (!myId || !otherId) {
    return <div>Error: Invalid chat ID format.</div>;
  }

  return (
    <div className="flex-1 flex overflow-auto flex-col">
      <ChatHeader userId={otherId} />
      <ChatScreen chatId={chatId} />
    </div>
  );
}
