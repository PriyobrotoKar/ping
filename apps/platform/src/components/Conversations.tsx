import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { IChat, IMessage, IUser } from "@ping/db";
import { Link, useParams } from "@tanstack/react-router";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ChatService from "@/api/services/chat";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

interface ConversationProps {
  searchResults: (IUser | IChat)[];
}

const Conversations = ({ searchResults }: ConversationProps) => {
  const params = useParams({
    strict: false,
  });

  const chatId = params.chatId;

  const { auth } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => await ChatService.getAllChats(),
  });

  const handleNewMessage = (message: IMessage) => {
    console.log("New message received:", message);
    refetch();
  };

  const handleUserOnline = () => {
    refetch();
  };

  const handleUserOffline = () => {
    refetch();
  };

  useEffect(() => {
    socket.on("new_message", handleNewMessage);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, []);

  if (searchResults.length > 0) {
    return <UserSearchResults users={searchResults} />;
  }

  if (isError || !data) {
    return <div className="p-4 text-red-500">Error loading conversations</div>;
  }

  return (
    <div>
      {data.map((chat) => {
        const sender = chat.participants.find((p) => p._id !== auth?._id) as
          | IUser
          | undefined;
        const lastMessage = chat.lastMessage as IMessage | undefined;

        if (!sender) return null;

        const isActive =
          chatId ===
          (chat.isGroupChat
            ? chat._id.toString()
            : `${auth?._id}-${sender._id.toString()}`);

        return (
          <Link
            to={chat.isGroupChat ? `/public/$chatId` : `/private/$chatId`}
            params={{
              chatId: chat.isGroupChat
                ? chat._id.toString()
                : `${auth?._id}-${sender._id.toString()}`,
            }}
          >
            <div
              key={chat._id.toString()}
              className={cn(
                "p-4 relative hover:bg-accent cursor-pointer",
                isActive && "bg-accent",
              )}
            >
              {chat.unreadCount > 0 && (
                <span
                  className={
                    "size-1.5 rounded-full bg-primary top-1/2 -translate-y-1/2 self-center absolute left-1.5"
                  }
                ></span>
              )}
              <div className="flex relative justify-between">
                <div className="flex gap-2 relative">
                  <Avatar className="size-10 overflow-visible relative border">
                    <AvatarImage>
                      <img
                        src={undefined}
                        alt={chat.groupName ?? sender.fullName}
                      />
                    </AvatarImage>
                    <AvatarFallback>
                      {chat.isGroupChat
                        ? chat.groupName.charAt(0)
                        : sender.fullName.charAt(0)}
                    </AvatarFallback>
                    {!chat.isGroupChat && sender.online && (
                      <span className="size-3 bg-green-500 absolute bottom-0 rounded-full right-0 border-2 border-background"></span>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {chat.isGroupChat ? chat.groupName : sender.fullName}
                    </h3>
                    <p
                      className={cn(
                        "text-sm line-clamp-1 text-muted-foreground",
                        chat.unreadCount && "text-foreground",
                      )}
                    >
                      {lastMessage?.content}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end self-stretch">
                  <span className="text-xs text-gray-400">
                    {lastMessage && (
                      <>
                        {new Date(lastMessage.createdAt).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </>
                    )}
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="text-xs bg-primary size-5 rounded-full text-primary-foreground flex justify-center items-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

interface UserSearchResultsProps {
  users: any[];
}

const UserSearchResults = ({ users }: UserSearchResultsProps) => {
  const chatId = useParams({
    strict: false,
  }).chatId;

  const { auth } = useAuth();
  return (
    <div>
      {users.map((user) => {
        const name = user.fullName || user.groupName;
        const isActive =
          chatId ===
          (user.isGroupChat
            ? user._id.toString()
            : `${auth?._id}-${user._id.toString()}`);

        return (
          <Link
            to={user.isGroupChat ? `/public/$chatId` : `/private/$chatId`}
            params={{
              chatId: user.isGroupChat
                ? user._id.toString()
                : `${auth?._id}-${user._id.toString()}`,
            }}
          >
            <div
              key={user._id.toString()}
              className={cn(
                "p-4 relative hover:bg-accent cursor-pointer",
                isActive && "bg-accent",
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Avatar className="size-10 relative overflow-visible border">
                    <AvatarImage>
                      <img src={undefined} alt={name} />
                    </AvatarImage>
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    {/* @ts-ignore */}
                    {user?.online && (
                      <span className="size-3 bg-green-500 absolute bottom-0 rounded-full right-0 border-2 border-background"></span>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{name}</h3>
                    <p className="text-sm max-w-40 overflow-ellipsis line-clamp-1 text-muted-foreground">
                      {/* @ts-ignore */}
                      {user?.email ?? user.lastMessage?.content}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Conversations;
