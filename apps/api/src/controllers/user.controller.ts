import { Chat, User } from "@ping/db";
import { Handler } from "express";

export const searchUser: Handler = async (req, res) => {
  // Get query and type from request query parameters
  const { query, type } = req.query;

  // Validate query and type
  if (!query || typeof query !== "string") {
    return res.status(200).json([]);
  }

  // get users based on the query
  const users = await User.find({
    fullName: { $regex: query, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .ne("_id", req.user?._id);

  // get chats based on the query
  const chats = await Chat.find({
    groupName: { $regex: query, $options: "i" },
  })
    .populate("lastMessage")
    .sort({ createdAt: -1 });

  let data: any[] = [];

  // Determine which data to return based on the type
  if (type === "users") {
    data = users;
  } else if (type === "chats") {
    data = chats;
  } else if (type === "all") {
    data = [...users, ...chats];
  }

  // sort the results by createdAt in descending order
  const results = data.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Return the results
  return res.status(200).json(results);
};

export const getAllUsers: Handler = async (_, res) => {
  // Fetch all users from the database
  const users = await User.find({}).sort({ createdAt: -1 });

  return res.status(200).json(users);
};

export const getUserById: Handler = async (req, res) => {
  // Get userId from request parameters
  const { userId } = req.params;
  // if userId is not provided, return a 400 error
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Fetch user by ID from the database
  const user = await User.findById(userId);

  // if user does not exist, return a 404 error
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Return the user data
  return res.status(200).json(user);
};
