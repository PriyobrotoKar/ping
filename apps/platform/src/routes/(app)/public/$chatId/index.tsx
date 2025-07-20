import { createFileRoute } from "@tanstack/react-router";
import ChatHeader from "@/components/ChatHeader";
import ChatScreen from "@/components/ChatScreen";
import GroupChatHeader from "@/components/GroupChatHeader";

export const Route = createFileRoute("/(app)/public/$chatId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const chatId = Route.useParams().chatId;

  return (
    <div className="flex-1 flex flex-col">
      <GroupChatHeader groupId={chatId} />
      <ChatScreen chatId={chatId} />
    </div>
  );
}
