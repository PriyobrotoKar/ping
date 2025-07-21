import { User } from "@ping/db";
import bcrypt from "bcryptjs";
import { BadRequestError, UnauthorizedError } from "@/lib/ApiError.js";
import { Handler } from "express";
import { generateToken } from "@/lib/utils.js";

export const signup: Handler = async (req, res) => {
  // get user data from request body
  const { fullName, email, password } = req.body;

  // validate user data
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if password is at least 6 characters
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // check if user already exists
  const user = await User.findOne({ email });

  // if user exists, throw an error
  if (user) throw new UnauthorizedError("User already exists");

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create a new user
  const newUser = new User({
    fullName,
    email,
    password: hashedPassword,
  });

  if (newUser) {
    // generate jwt token here
    const token = generateToken(newUser._id.toString());
    await newUser.save();

    // set the jwt token in a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    // return the user data
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } else {
    throw new BadRequestError("Invalid user data");
  }
};

export const login: Handler = async (req, res) => {
  // get user data from request body
  const { email, password } = req.body;

  // get user with the provided email
  const user = await User.findOne({ email });

  // if user does not exist, throw an error
  if (!user) {
    throw new BadRequestError("User with this email does not exist");
  }

  // check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new BadRequestError("Invalid credentials");
  }

  // generate jwt token and set it in a cookie
  const token = generateToken(user._id.toString());

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  // return the user data
  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
    token,
  });
};

export const logout: Handler = (_, res) => {
  // clear the jwt cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const checkAuth: Handler = async (req, res) => {
  // check if the current user exists
  const user = await User.findOne({ _id: req.user._id });

  res.status(200).json(user);
};
