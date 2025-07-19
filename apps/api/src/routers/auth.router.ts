import {
  checkAuth,
  login,
  logout,
  signup,
} from "@/controllers/auth.controller";
import { Router } from "express";

const authRouter: Router = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/check", checkAuth);

export default authRouter;
