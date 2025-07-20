import { BadRequestError, NotFoundError } from "@/lib/ApiError";
import { Chat, Message } from "@ping/db";
import { Handler } from "express";

export const getChat: Handler = async (req, res) => {
  const { chatId } = req.params;

  // Find the chat by ID and populate participants and last message
  const chat = await Chat.findById(chatId)
    .populate("participants", "-password")
    .populate("lastMessage");

  if (!chat) {
    throw new NotFoundError("Chat not found");
  }

  res.status(200).json(chat);
};

export const createChat: Handler = async (req, res) => {
  const { userIds, groupName } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError("Invalid user IDs");
  }

  const isGroup = userIds.length > 2;

  let chat = null;

  if (isGroup && groupName) {
    chat = await Chat.create({
      participants: userIds,
      groupName,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });
  } else {
    chat = await Chat.create({
      participants: userIds,
      isGroupChat: false,
    });
  }

  // Create a new chat with the provided user IDs

  res.status(201).json(chat);
};

export const isChatExists: Handler = async (req, res) => {
  const { userIds: ids } = req.query;

  const userIds = (ids as string).split(",").map((id) => id.trim());

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError("Invalid user IDs");
  }

  // Check if a chat exists with the provided user IDs
  const chat = await Chat.findOne({
    participants: { $all: userIds },
  }).populate("participants", "-password");

  if (!chat) {
    throw new NotFoundError("Chat not found");
  }

  res.status(200).json(chat);
};

export const getMessages: Handler = async (req, res) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "-password")
    .sort({ createdAt: 1 });

  res.status(200).json(messages);
};

export const getAllChats: Handler = async (req, res) => {
  const userId = req.user._id;

  // Find all chats where the user is a participant
  const chats = await Chat.aggregate([
    { $match: { participants: userId } },

    // Join participants
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participants",
      },
    },

    // Join lastMessage
    {
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
      },
    },
    {
      $unwind: {
        path: "$lastMessage",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Lookup unread messages for the current user
    {
      $lookup: {
        from: "messages",
        let: { chatId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$chat", "$$chatId"] },
                  { $not: { $in: [userId, "$readBy"] } }, // unread for user
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "unreadMeta",
      },
    },

    // Extract count or default to 0
    {
      $addFields: {
        unreadCount: {
          $cond: [
            { $gt: [{ $size: "$unreadMeta" }, 0] },
            { $arrayElemAt: ["$unreadMeta.count", 0] },
            0,
          ],
        },
      },
    },

    // Remove unreadMeta array (optional)
    {
      $project: {
        unreadMeta: 0,
      },
    },

    // Sort by lastMessage.createdAt
    {
      $sort: {
        "lastMessage.createdAt": -1,
      },
    },
  ]);
  res.status(200).json(chats);
};

export const markAsRead: Handler = async (req, res) => {
  const { messageIds } = req.query;
  const userId = req.user._id;

  console.log("Marking messages as read:", messageIds);

  const ids = (messageIds as unknown as string)
    .split(",")
    .map((id) => id.trim());

  if (!messageIds || !Array.isArray(ids)) {
    throw new BadRequestError("Invalid message IDs");
  }

  // Mark messages as read by the user
  const updatedMessages = await Message.updateMany(
    { _id: { $in: ids }, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } },
    { new: true },
  );

  return res.status(200).json(updatedMessages);
};
