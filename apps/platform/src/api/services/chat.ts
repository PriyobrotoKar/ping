import { IChat, IMessage, IUser } from "@ping/db";
import ApiClient from "../client";

class ChatService {
  private static apiClient: ApiClient = new ApiClient("/chat");

  static async createChat(data: { userIds: string[]; groupName?: string }) {
    return this.apiClient.post<IChat>("/", data);
  }

  static async isChatExists(userIds: string[]) {
    return this.apiClient.get<IChat & { participants: IUser[] }>("/exists", {
      userIds: userIds.join(","),
    });
  }

  static async getMessages(chatId: string) {
    return this.apiClient.get<(IMessage & { sender: IUser })[]>(
      `/${chatId}/messages`,
    );
  }

  static async getAllChats() {
    return this.apiClient.get<(IChat & { unreadCount: number })[]>("/");
  }

  static async getChat(chatId: string) {
    return this.apiClient.get<IChat & { participants: IUser[] }>(`/${chatId}`);
  }

  static async markAsRead(messageIds: string[]) {
    return this.apiClient.post<IMessage>(`/messages/read`, undefined, {
      messageIds: messageIds.join(","),
    });
  }
}

export default ChatService;
