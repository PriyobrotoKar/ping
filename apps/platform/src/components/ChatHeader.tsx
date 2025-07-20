import UserService from "@/api/services/user";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

interface ChatHeaderProps {
  userId: string;
}

const ChatHeader = ({ userId }: ChatHeaderProps) => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => UserService.getUserById(userId),
  });
  const [online, setOnline] = useState(data?.online || false);

  const handleUserOnline = ({ userId: user_id }: { userId: string }) => {
    if (user_id !== userId) return;
    setOnline(true);
  };

  const handleUserOffline = ({ userId: user_id }: { userId: string }) => {
    if (user_id !== userId) return;
    setOnline(false);
  };

  useEffect(() => {
    if (data) {
      setOnline(data.online);
    }
  }, [data]);

  useEffect(() => {
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, []);

  if (isLoading) {
    return <header>Loading...</header>;
  }

  if (isError || !data) {
    return <header>Error loading user</header>;
  }

  return (
    <header className="flex fixed top-0 bg-background gap-4 px-4 py-3 border-b w-full items-center">
      <div>
        <Avatar className="size-10 overflow-visible relative border">
          <AvatarImage>
            <img src={undefined} alt={data.fullName} />
          </AvatarImage>
          <AvatarFallback>{data.fullName.charAt(0)}</AvatarFallback>
          {online && (
            <span className="size-3 bg-green-500 absolute bottom-0 rounded-full right-0 border-2 border-background"></span>
          )}
        </Avatar>
      </div>
      <div className="font-medium">
        <h3>{data.fullName}</h3>
        <p className="text-sm text-muted-foreground">
          {online
            ? "Online"
            : `Last Seen at ${new Date(data.lastSeen).toLocaleString()}`}
        </p>
      </div>
    </header>
  );
};

export default ChatHeader;
