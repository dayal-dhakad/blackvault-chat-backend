import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/app-error";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError("Unauthorized", StatusCodes.UNAUTHORIZED));
    return;
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: new mongoose.Types.ObjectId(decoded.userId),
      email: decoded.email
    };
    next();
  } catch (_error) {
    next(new AppError("Invalid or expired access token", StatusCodes.UNAUTHORIZED));
  }
};
