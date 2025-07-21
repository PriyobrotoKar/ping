import { IChat, IUser } from "@ping/db";
import ApiClient from "../client";

class UserService {
  private static apiClient: ApiClient = new ApiClient("/user");

  static async search(query: string, type: "users" | "chats" | "all" = "all") {
    return this.apiClient.get<(IUser | IChat)[]>("/search", {
      query,
      type,
    });
  }

  static async getAllUsers() {
    return this.apiClient.get<IUser[]>("/");
  }

  static async getUserById(userId: string) {
    return this.apiClient.get<IUser>(`/${userId}`);
  }

  static async updateProfile(data: FormData) {
    return this.apiClient.patch<IUser>("/", data);
  }
}

export default UserService;
