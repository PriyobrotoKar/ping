import { IChat, IMessage } from "@ping/db";
import ApiClient from "../client";

class ChatService {
  private static apiClient: ApiClient = new ApiClient("/chat");

  static async createChat(data: { userIds: string[]; groupName?: string }) {
    return this.apiClient.post<IChat>("/", data);
  }

  static async isChatExists(userIds: string[]) {
    return this.apiClient.get<IChat>("/exists", {
      userIds: userIds.join(","),
    });
  }

  static async getMessages(chatId: string) {
    console.log("Fetching messages for chat:", chatId);
    return this.apiClient.get<IMessage[]>(`/${chatId}/messages`);
  }

  static async getAllChats() {
    return this.apiClient.get<(IChat & { unreadCount: number })[]>("/");
  }

  static async getChat(chatId: string) {
    return this.apiClient.get<IChat>(`/${chatId}`);
  }

  static async markAsRead(messageIds: string[]) {
    return this.apiClient.post<IMessage>(`/messages/read`, undefined, {
      messageIds: messageIds.join(","),
    });
  }
}

export default ChatService;
