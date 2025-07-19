import { IUser } from "@ping/db";
import ApiClient from "../client";

class UserService {
  private static apiClient: ApiClient = new ApiClient("/user");

  static async search(query: string) {
    return this.apiClient.get<IUser[]>("/search", {
      query,
    });
  }

  static async getAllUsers() {
    return this.apiClient.get<IUser[]>("/");
  }
}

export default UserService;
