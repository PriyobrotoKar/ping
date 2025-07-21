import { BadRequestError, NotFoundError } from "@/lib/ApiError";
import { Chat, Message } from "@ping/db";
import { Handler } from "express";

export const getChat: Handler = async (req, res) => {
  // Get chat ID from request parameters
  const { chatId } = req.params;

  // Find the chat by ID and populate participants and last message
  const chat = await Chat.findById(chatId)
    .populate("participants", "-password")
    .populate("lastMessage");

  // If chat is not found, throw a NotFoundError
  if (!chat) {
    throw new NotFoundError("Chat not found");
  }

  res.status(200).json(chat);
};

export const createChat: Handler = async (req, res) => {
  // Get user IDs and group name from request body
  const { userIds, groupName } = req.body;

  // Validate user IDs
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError("Invalid user IDs");
  }

  // check if participants are at least 2, if yes create a group chat
  const isGroup = userIds.length > 2;

  let chat = null;

  if (isGroup && groupName) {
    // create a group chat
    chat = await Chat.create({
      participants: userIds,
      groupName,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });
  } else {
    // create a one-on-one chat
    chat = await Chat.create({
      participants: userIds,
      isGroupChat: false,
    });
  }

  res.status(201).json(chat);
};

export const isChatExists: Handler = async (req, res) => {
  // Get user IDs from query parameters
  const { userIds: ids } = req.query;
  const userId = req.user._id;

  // creating an array of user IDs from the query parameter
  const userIds = (ids as string).split(",").map((id) => id.trim());

  // Validate user IDs
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new BadRequestError("Invalid user IDs");
  }

  // if the current user is not in the userIds, then throw bad request error
  if (!userIds.includes(userId.toString())) {
    throw new BadRequestError("Chat not found");
  }

  // Check if a chat exists with the provided user IDs
  const chat = await Chat.findOne({
    participants: { $all: userIds },
  }).populate("participants", "-password");

  // if not found, throw a NotFoundError
  if (!chat) {
    throw new NotFoundError("Chat not found");
  }

  // return the chat
  res.status(200).json(chat);
};

export const getMessages: Handler = async (req, res) => {
  // Get chat ID from request parameters
  const { chatId } = req.params;

  // get messages for the chat
  const messages = await Message.find({ chat: chatId })
    .populate("sender", "-password")
    .sort({ createdAt: 1 });

  // return messages
  res.status(200).json(messages);
};

export const getAllChats: Handler = async (req, res) => {
  // Get the logged-in user's ID
  const userId = req.user._id;

  // Find all chats where the user is a participant
  // get all chats for the user with participants and last message details and unread messages count
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

  // return the chats
  res.status(200).json(chats);
};

export const markAsRead: Handler = async (req, res) => {
  // Get message IDs from query parameters
  const { messageIds } = req.query;
  // Get the logged-in user's ID
  const userId = req.user._id;

  // create an array of message IDs from the query parameter
  const ids = (messageIds as unknown as string)
    .split(",")
    .map((id) => id.trim());

  // Validate message IDs
  if (!messageIds || !Array.isArray(ids)) {
    throw new BadRequestError("Invalid message IDs");
  }

  // Mark messages as read by the user
  const updatedMessages = await Message.updateMany(
    { _id: { $in: ids }, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } },
    { new: true },
  );

  // return the updated messages
  return res.status(200).json(updatedMessages);
};
