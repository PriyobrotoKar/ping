import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useQuery } from "@tanstack/react-query";
import ChatService from "@/api/services/chat";

interface GroupChatHeaderProps {
  groupId: string;
}

const GroupChatHeader = ({ groupId }: GroupChatHeaderProps) => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => ChatService.getChat(groupId),
  });

  if (isLoading) {
    return <header>Loading...</header>;
  }

  if (isError || !data) {
    return <header>Error loading user</header>;
  }

  return (
    <header className="flex bg-background fixed gap-4 px-4 py-3 border-b w-full items-center">
      <div>
        <Avatar className="size-10 overflow-visible relative border">
          <AvatarImage>
            <img src={undefined} alt={data.groupName} />
          </AvatarImage>
          <AvatarFallback>{data.groupName.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="font-medium">
        <h3>{data.groupName}</h3>
        <p className="text-sm text-muted-foreground">
          {data.participants.length} members
        </p>
      </div>
    </header>
  );
};

export default GroupChatHeader;
