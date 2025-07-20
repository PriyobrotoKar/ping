import { User } from "@ping/db";
import { Handler } from "express";

export const searchUser: Handler = async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(200).json([]);
  }

  const users = await User.find({
    fullName: { $regex: query, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .ne("_id", req.user?._id);

  return res.status(200).json(users);
};

export const getAllUsers: Handler = async (_, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });

  return res.status(200).json(users);
};

export const getUserById: Handler = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json(user);
};
