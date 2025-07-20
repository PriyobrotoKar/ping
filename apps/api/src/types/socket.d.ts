import { Socket } from "socket.io";
import { IUser } from "@ping/db";

declare module "socket.io" {
  interface Socket {
    user: IUser;
  }
}
