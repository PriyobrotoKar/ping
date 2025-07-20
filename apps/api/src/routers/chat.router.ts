import {
  createChat,
  getAllChats,
  getChat,
  getMessages,
  isChatExists,
  markAsRead,
} from "@/controllers/chat.controller";
import { Router } from "express";

const chatRouter: Router = Router();

chatRouter.get("/:chatId/messages", getMessages);
chatRouter.post("/messages/read", markAsRead);
chatRouter.get("/exists", isChatExists);
chatRouter.get("/:chatId", getChat);
chatRouter.post("/", createChat);
chatRouter.get("/", getAllChats);

export default chatRouter;
