import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // get the status code and message from the error object
  let statusCode = err.statusCode ?? 500;
  let message = err.message ?? "Internal Server Error";
  const status = "error";

  // if env is production, do not expose error details
  if (process.env.NODE_ENV !== "production") {
    console.error("Error occurred:", err.message);
  }

  // return status code and message
  return res.status(statusCode).json({
    status,
    message,
  });
};
