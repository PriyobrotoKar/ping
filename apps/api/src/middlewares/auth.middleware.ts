import jwt from "jsonwebtoken";
import { User } from "@ping/db";
import { Handler } from "express";
import { CurrentUser } from "@/types/auth";
import { UnauthorizedError } from "@/lib/ApiError";

const publicRoutes = ["/auth/signup", "/auth/login", "/health"];

export const protectRoute: Handler = async (req, res, next) => {
  console.log("Protecting route: ", req.path);
  try {
    // Check if the request path is a public route
    if (publicRoutes.includes(req.path)) {
      return next();
    }

    // get the JWT token from cookies
    const token = req.cookies.jwt;

    // if token is not present, throw an UnauthorizedError
    if (!token) {
      throw new UnauthorizedError();
    }

    // verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as
      | CurrentUser
      | undefined;

    // if the token is invalid or expired, decoded will be undefined
    if (!decoded) {
      throw new UnauthorizedError("Invalid token");
    }

    // find the user by ID from the decoded token
    const user = await User.findById(decoded._id).select("-password");

    // if user is not found, return a UnauthorizedError
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // attach the user to the request object
    req.user = {
      _id: user._id,
    };

    // call the next middleware or route handler
    next();
  } catch (error: any) {
    console.log("Error in protectRoute middleware: ", error.message);
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError();
    }
    throw error;
  }
};
