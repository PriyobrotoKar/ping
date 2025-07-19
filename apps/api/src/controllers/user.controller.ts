import { User } from "@ping/db";
import { Handler } from "express";

export const searchUser: Handler = async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(200).json([]);
  }

  const users = await User.find({
    fullName: { $regex: query, $options: "i" },
  }).sort({ createdAt: -1 });

  return res.status(200).json(users);
};

export const getAllUsers: Handler = async (_, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });

  return res.status(200).json(users);
};
