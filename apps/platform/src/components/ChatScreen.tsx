import { FormEvent, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { IconSend } from "@tabler/icons-react";
import { socket } from "@/lib/socket";
import { IChat, IMessage } from "@ping/db";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import ChatService from "@/api/services/chat";
import { ClientError } from "@/api/client";

interface ChatScreenProps {
  chatId: string;
}

const ChatScreen = ({ chatId }: ChatScreenProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatIdState, setChatIdState] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { auth } = useAuth();

  const scrollToBottom = () => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };

  const { data, isError } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const participants = chatId.split("-");

      try {
        let id = chatId;
        let participants = chatId.split("-");

        if (chatId.includes("-")) {
          console.log("participants:", participants);
          const chatExists = await ChatService.isChatExists(participants);
          id = chatExists._id.toString();
          console.log("chat exists", chatExists);
          participants = chatExists.participants.map((p) => p._id.toString());
        } else {
          const chat = await ChatService.getChat(chatId);
          participants = chat.participants.map((p) => p._id.toString());
        }

        console.log("settigns participants:", participants);

        participants = participants.filter((p) => p !== auth?._id.toString());
        const messages = await ChatService.getMessages(id);
        setParticipants(participants);
        setChatIdState(id);
        return messages;
      } catch (error) {
        if (error instanceof ClientError && error.status === 404) {
          console.error("Chat not found, creating new chat");
          const chat = await ChatService.createChat({ userIds: participants });
          setChatIdState(chat._id.toString());
          return [];
        }

        console.error("Error fetching messages:", error);
      }
    },
  });

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(participants, chatIdState);

    socket.emit("send_message", {
      chatId: chatIdState,
      content: message,
      to: participants,
    });

    setMessage("");
    scrollToBottom();
  };

  const handleUserJoined = async () => {
    console.log("User joined chat");
  };
  const queryClient = useQueryClient();

  const handleNewMessage = (data: IMessage) => {
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
      // queryClient.invalidateQueries({
      //   queryKey: ["messages", chatIdState],
      // });
      // queryClient.setQueryData(
      //   ["messages", chatIdState],
      //   (oldMessages: IMessage[]) => {
      //     if (!oldMessages) return oldMessages;
      //
      //     return oldMessages.map((msg) => ({
      //       ...msg,
      //       readBy: [...(msg.readBy || []), auth?._id],
      //     }));
      //   },
      // );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  useEffect(() => {
    if (!data) return;

    setMessages(data);

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

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("new_message", handleNewMessage);
    };
  }, [chatIdState]);

  if (isError || !data) {
    return <div>Error loading messages</div>;
  }

  return (
    <div className="p-8 flex flex-1 flex-col pt-16 h-svh">
      <div className="flex-1 overflow-auto py-4" ref={chatContainerRef}>
        {messages.map((message, i) => {
          const isOwn = message.sender._id === auth?._id;
          const isConsecutive = messages[i - 1]
            ? messages[i - 1]?.sender._id === message.sender._id
            : false;

          return (
            <div className="flex" key={message._id.toString()}>
              <div
                className={cn(
                  "px-4 py-3 rounded-b-lg bg-accent",
                  isOwn
                    ? "ml-auto bg-primary text-primary-foreground rounded-tl-lg"
                    : "rounded-tr-lg",
                  isConsecutive && "rounded-lg mt-1",
                )}
              >
                {message.content}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-4">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
