import express, { Request } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware";
import { NotFoundError } from "./lib/ApiError";
import { protectRoute } from "./middlewares/auth.middleware";
import router from "./routers";

// create an Express application
const app = express();

// set middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
// set security headers
app.use(helmet());

// parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// register routers
app.use("/api", protectRoute, router);

// health check endpoint
app.get("/api/health", (_, res) => {
  res.status(200).send("OK");
});

// Handle 404 errors for undefined routes
app.use((req: Request) => {
  console.log(`Resource not found: ${req.originalUrl}`);
  throw new NotFoundError(`Resource not found: ${req.originalUrl}`);
});

// global error handler
app.use(errorHandler);

export default app;
