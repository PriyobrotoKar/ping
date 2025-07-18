import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode ?? 500;
  let message = err.message ?? "Internal Server Error";
  const status = "error";

  if (err instanceof ZodError) {
    statusCode = 400;
    res.status(statusCode).json({
      status,
      errors: err.issues,
    });

    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("Error occurred:", err.message);
  }

  return res.status(statusCode).json({
    status,
    message,
  });
};
