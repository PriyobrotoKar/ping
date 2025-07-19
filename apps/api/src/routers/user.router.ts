import { getAllUsers, searchUser } from "@/controllers/user.controller";
import { Router } from "express";

const userRouter: Router = Router();

userRouter.get("/search", searchUser);
userRouter.get("/", getAllUsers);

export default userRouter;
