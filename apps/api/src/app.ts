import express from "express";
import cookieParser from "cookie-parser";
import { protectRoute } from "./middlewares/auth.middleware";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(protectRoute);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

export default app;
