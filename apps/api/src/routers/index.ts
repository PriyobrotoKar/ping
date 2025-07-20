import { Router } from "express";
import authRouter from "./auth.router";
import userRouter from "./user.router";
import chatRouter from "./chat.router";

const router: Router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/chat", chatRouter);

export default router;
