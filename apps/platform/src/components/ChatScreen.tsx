import { FormEvent, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { IconDots, IconSend } from "@tabler/icons-react";
import { socket } from "@/lib/socket";
import { IChat, IMessage, IUser } from "@ping/db";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import ChatService from "@/api/services/chat";
import { ClientError } from "@/api/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ChatScreenProps {
  chatId: string;
}

type MessageWithSender = IMessage & { sender: IUser };

const ChatScreen = ({ chatId }: ChatScreenProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [usersTyping, setUsersTyping] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [chatIdState, setChatIdState] = useState<string | null>(null);
  const [participants, setParticipants] = useState<IUser[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingUsers = participants.filter((p) =>
    usersTyping.includes(p._id.toString()),
  );

  const { auth } = useAuth();

  const scrollToBottom = () => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };

  const { data, isError, error } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const participantIds = chatId.split("-");

      try {
        let id = chatId;

        let participants: IUser[] = [];

        if (chatId.includes("-")) {
          const chatExists = await ChatService.isChatExists(participantIds);
          id = chatExists._id.toString();
          console.log("participants:", chatExists.participants);
          participants = chatExists.participants;
        } else {
          const chat = await ChatService.getChat(chatId);
          setAdminId((chat.groupAdmin as string | undefined) ?? null);
          participants = chat.participants;
        }

        participants = participants.filter(
          (p) => p._id.toString() !== auth?._id.toString(),
        );
        const messages = await ChatService.getMessages(id);
        setParticipants(participants);
        setChatIdState(id);
        return messages;
      } catch (error) {
        if (error instanceof ClientError && error.status === 404) {
          console.error("Chat not found, creating new chat");
          const chat = await ChatService.createChat({
            userIds: participantIds,
          });
          setChatIdState(chat._id.toString());
          return [];
        }

        if (error instanceof ClientError && error.status === 400) {
          throw new Error("Chat Not Found");
        }

        throw new Error("Failed to fetch messages");
      }
    },
  });

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(participants, chatIdState);

    socket.emit("send_message", {
      chatId: chatIdState,
      content: message,
      to: participants.map((p) => p._id.toString()),
    });

    setMessage("");
    setIsTyping(false);
    scrollToBottom();
  };

  const handleUserJoined = async () => {
    console.log("User joined chat");
  };
  const queryClient = useQueryClient();

  const handleNewMessage = (data: MessageWithSender) => {
    console.log("New message received:", data);
    if ((data.chat as unknown as string) !== chatIdState) {
      return;
    }

    setMessages((prev) => [...prev, data]);
    setMessagesAsRead([data]);
    queryClient.setQueryData(["chats"], (oldChats: IChat[]) => {
      if (!oldChats) return oldChats;

      return oldChats.map((chat) => {
        if (chat._id.toString() === chatIdState) {
          return {
            ...chat,
            lastMessage: data,
          };
        }
        return chat;
      });
    });
  };

  const setMessagesAsRead = async (messages: IMessage[]) => {
    if (!chatIdState || messages.length === 0) return;

    const messageIds = messages
      .filter((msg) => !msg.readBy.includes(auth?._id!))
      .map((msg) => msg._id.toString());

    if (messageIds.length === 0) return;

    try {
      await ChatService.markAsRead(messageIds);
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleInputChnage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleUserTyping = (data: { userId: string; chatId: string }) => {
    if (data.chatId !== chatIdState) return;

    if (data.userId === auth?._id.toString()) return;

    setUsersTyping((prev) => {
      if (!prev.includes(data.userId)) {
        return [...prev, data.userId];
      }
      return prev;
    });

    scrollToBottom();
  };

  const handleUserTypingStop = (data: { userId: string; chatId: string }) => {
    if (data.chatId !== chatIdState) return;

    if (data.userId === auth?._id.toString()) return;

    setUsersTyping((prev) => prev.filter((id) => id !== data.userId));
  };

  useEffect(() => {
    if (typingUsers.length !== 0) {
      scrollToBottom();
    }
  }, [typingUsers]);

  useEffect(() => {
    if (!isTyping && !message) return;

    setIsTyping(true);

    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [message]);

  useEffect(() => {
    if (isTyping) socket.emit("typing_start", chatIdState);
    else socket.emit("typing_stop", chatIdState);
  }, [isTyping]);

  useEffect(() => {
    if (!data) return;

    setMessages(data);

    console.log(data);

    setMessagesAsRead(data);
  }, [data]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatIdState) return;

    console.log("Joining chat:", chatIdState);

    socket.emit("join_chat", chatIdState);
    scrollToBottom();

    socket.on("user_joined", handleUserJoined);
    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserTypingStop);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("new_message", handleNewMessage);
    };
  }, [chatIdState]);

  if (isError || !data) {
    return (
      <div className="flex-1 text-destructive flex justify-center items-center">
        {error?.message}
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-1 flex-col pt-16 h-svh">
      <div
        className="flex-1 overflow-auto py-4 no-scrollbar"
        ref={chatContainerRef}
      >
        {messages.map((message, i) => {
          const isAdmin = message.sender._id.toString() === adminId;
          const isGroupChat = !chatId.includes("-");
          const isOwn = message.sender._id === auth?._id;
          const isConsecutive = messages[i - 1]
            ? messages[i - 1]?.sender._id === message.sender._id
            : false;

          return (
            <div
              className={cn("flex gap-2", !isConsecutive && "mt-4")}
              key={message._id.toString()}
            >
              {!isConsecutive && !isOwn && isGroupChat && (
                <Avatar className="size-10 overflow-visible relative border">
                  <AvatarImage>
                    <img src={undefined} alt={message.sender.fullName} />
                  </AvatarImage>
                  <AvatarFallback>
                    {message.sender.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn("space-y-1", isOwn && "ml-auto")}>
                {!isConsecutive && (
                  <div className="text-sm text-muted-foreground flex gap-4">
                    {isGroupChat && !isOwn && (
                      <div className="space-x-2">
                        <span className="font-medium">
                          {message.sender.fullName.split(" ")[0]}
                        </span>
                        {isAdmin && (
                          <span className="bg-primary rounded-sm font-medium text-primary-foreground text-xs px-1.5 py-0.5">
                            Admin
                          </span>
                        )}
                      </div>
                    )}
                    <span className={cn("inline-block", isOwn && "ml-auto")}>
                      {new Date(message.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "px-4 py-3 rounded-b-lg min-w-24 bg-accent w-fit",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-tl-lg"
                      : "rounded-tr-lg ",
                    isConsecutive && "rounded-lg mt-1",
                    isGroupChat && !isOwn && isConsecutive && "ml-12",
                  )}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex gap-2 mt-4">
            <div className="flex -space-x-4">
              {typingUsers.map((user, i) => {
                const isGroupChat = !chatId.includes("-");
                if (!isGroupChat) return null;

                return (
                  <Avatar
                    style={{
                      zIndex: 0 - i,
                    }}
                    className="size-10 border-2 border-background overflow-visible relative"
                  >
                    <AvatarImage>
                      <img src={undefined} alt={user.fullName} />
                    </AvatarImage>
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
            <div>
              {!chatId.includes("-") && (
                <div className="text-sm text-muted-foreground">
                  {typingUsers.length === 1
                    ? typingUsers[0]?.fullName
                    : typingUsers.map((u) => u.fullName).join(", ")}
                </div>
              )}

              <div
                className={cn(
                  "px-4 py-3 rounded-tl-none rounded-r-lg rounded-b-lg min-w-24 text-muted-foreground bg-accent",
                )}
              >
                typing...
              </div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-4">
        <Input
          value={message}
          onChange={handleInputChnage}
          className="flex-1"
          placeholder="Type your message..."
        />
        <Button size={"icon"}>
          <IconSend />
        </Button>
      </form>
    </div>
  );
};

export default ChatScreen;
