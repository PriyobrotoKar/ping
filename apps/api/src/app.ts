import express from "express";
import cookieParser from "cookie-parser";

// Erokhom kore User model access korish....
import { User } from "@ping/db";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

export default app;
