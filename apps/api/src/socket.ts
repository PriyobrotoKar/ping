import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Chat, Message, User } from "@ping/db";
import { CurrentUser } from "./types/auth";

function getCookie(cName: string, socket: Socket) {
  const name = cName + "=";
  if (!socket.handshake.headers.cookie) {
    return null;
  }
  const cDecoded = decodeURIComponent(socket.handshake.headers.cookie);
  const cArr = cDecoded.split(";");
  let res;
  cArr.forEach((val) => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  });
  return res;
}

function createWebSocketServer(server: ReturnType<typeof createServer>) {
  const ws = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  ws.use(async (socket, next) => {
    try {
      const token = getCookie("jwt", socket);
      console.log("Socket token:", token);

      if (!token) {
        throw new Error("Authentication error");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CurrentUser;
      const user = await User.findById(decoded._id);

      if (!user) {
        throw new Error("User not found");
      }

      socket.user = user;
      next();
    } catch (error: any) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication failed"));
    }
  });

  ws.on("connection", (socket) => {
    console.log("User connected:", socket.user._id);

    // Update user status to online
    // This will also emit an event to notify other clients
    User.findByIdAndUpdate(socket.user._id, {
      online: true,
      lastSeen: new Date(),
    }).then(() => {
      ws.emit("user_online", { userId: socket.user._id });
    });

    handleSocketMessages(ws, socket);

    socket.on("disconnect", async () => {
      // Update user status to offline
      // This will also emit an event to notify other clients
      console.log("User disconnected:", socket.user._id);
      try {
        await User.findByIdAndUpdate(socket.user._id, {
          online: false,
          lastSeen: new Date(),
        });
        ws.emit("user_offline", { userId: socket.user._id });
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
}

function handleSocketMessages(ws: Server, socket: Socket) {
  // join global room for notifications

  socket.on("join_global", (userId: string) => {
    socket.join(`global_${userId}`);
    console.log(`User joined global room: global_${userId}`);
  });

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Send a new message
  socket.on("send_message", async (data) => {
    try {
      const { chatId, content, to } = data;

      // Create new message
      const message = new Message({
        sender: socket.user._id,
        chat: chatId,
        content,
        readBy: [socket.user._id],
      });
      await message.save();

      // Populate sender and update chat's last message
      const populatedMessage = await Message.findById(message._id).populate(
        "sender",
        "-password",
      );

      console.log("ChatID:", chatId);

      await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

      const globalUserRooms = to.map((userId: string) => `global_${userId}`);

      console.log("Global user rooms:", globalUserRooms);

      // Emit to all in the chat room
      ws.to(chatId).to(globalUserRooms).emit("new_message", populatedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Typing indicators
  socket.on("typing_start", (chatId) => {
    socket.to(chatId).emit("user_typing", {
      userId: socket.user._id,
      chatId,
    });
  });

  socket.on("typing_stop", (chatId) => {
    socket.to(chatId).emit("user_stopped_typing", {
      userId: socket.user._id,
      chatId,
    });
  });
}

export default createWebSocketServer;
