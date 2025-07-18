import express, { Request } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware";
import { NotFoundError } from "./lib/ApiError";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_, res) => {
  res.status(200).send("OK");
});

app.use((req: Request) => {
  console.log(`Resource not found: ${req.originalUrl}`);
  throw new NotFoundError(`Resource not found: ${req.originalUrl}`);
});

app.use(errorHandler);

export default app;
