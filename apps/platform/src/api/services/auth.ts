import { IUser } from "@ping/db";
import ApiClient from "../client";

class AuthService {
  private static apiClient: ApiClient = new ApiClient("/auth");

  static async login(data: { email: string; password: string }) {
    return this.apiClient.post<IUser>("/login", data);
  }

  static async register(data: {
    email: string;
    password: string;
    fullName: string;
  }) {
    return this.apiClient.post<IUser>("/signup", data);
  }

  static async checkAuth() {
    return this.apiClient.get<IUser>("/check");
  }

  static async logout() {
    return this.apiClient.post("/logout");
  }
}

export default AuthService;
