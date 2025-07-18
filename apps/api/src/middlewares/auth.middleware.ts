import jwt from "jsonwebtoken";
import { User } from "@ping/db";
import { Handler } from "express";
import { CurrentUser } from "@/types/auth";
import { UnauthorizedError } from "@/lib/ApiError";

const publicRoutes = ["/api/health"];

export const protectRoute: Handler = async (req, res, next) => {
  try {
    if (publicRoutes.includes(req.path)) {
      return next();
    }

    const token = req.cookies.jwt;

    if (!token) {
      throw new UnauthorizedError();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as
      | CurrentUser
      | undefined;

    if (!decoded) {
      throw new UnauthorizedError("Invalid token");
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = {
      userId: user._id.toString(),
    };

    next();
  } catch (error: any) {
    console.log("Error in protectRoute middleware: ", error.message);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError();
    }
    throw error;
  }
};
