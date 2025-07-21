import {
  getAllUsers,
  getUserById,
  searchUser,
  updateProfile,
} from "@/controllers/user.controller";
import { upload } from "@/lib/storage";
import { Router } from "express";

const userRouter: Router = Router();

userRouter.get("/search", searchUser);
userRouter.get("/", getAllUsers);
userRouter.get("/:userId", getUserById);

export default userRouter;
