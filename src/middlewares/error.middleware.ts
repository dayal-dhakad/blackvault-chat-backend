import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

import { env } from "../config/env";
import { AppError } from "../utils/app-error";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Database validation failed";
    details = err.errors;
  } else if ((err as { code?: number }).code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    message = "Resource already exists";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.NODE_ENV !== "production" ? { stack: err.stack } : {})
  });
};
