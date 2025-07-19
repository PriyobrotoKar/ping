import { User } from "@ping/db";
import bcrypt from "bcryptjs";
import { BadRequestError, UnauthorizedError } from "@/lib/ApiError.js";
import { Handler } from "express";
import { generateToken } from "@/lib/utils.js";

export const signup: Handler = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const user = await User.findOne({ email });

  if (user) throw new UnauthorizedError("User already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullName,
    email,
    password: hashedPassword,
  });

  if (newUser) {
    // generate jwt token here
    const token = generateToken(newUser._id.toString());
    await newUser.save();

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "strict",
    });
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
  console.log("Login request body:", req.body);
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new BadRequestError("Invalid credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new BadRequestError("Invalid credentials");
  }

  const token = generateToken(user._id.toString());

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: "strict",
  });

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
  });
};

export const logout: Handler = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile: Handler = async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;

  if (!profilePic) {
    throw new BadRequestError("Profile picture is required");
  }

  // const uploadResponse = await cloudinary.uploader.upload(profilePic);
  // const updatedUser = await User.findByIdAndUpdate(
  //   userId,
  //   { profilePic: uploadResponse.secure_url },
  //   { new: true },
  // );

  // res.status(200).json(updatedUser);
  res.status(200).json({ message: "Not implemented Yet" });
};

export const checkAuth: Handler = async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });

  res.status(200).json(user);
};
