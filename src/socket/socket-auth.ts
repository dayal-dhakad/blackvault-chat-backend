import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ExtendedError } from "socket.io/dist/namespace";

import { verifyAccessToken } from "../utils/jwt";
import { AuthenticatedSocket } from "../types/socket";
import { AppError } from "../utils/app-error";

export const socketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
): void => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      throw new AppError("Socket authentication token is required", StatusCodes.UNAUTHORIZED);
    }

    const decoded = verifyAccessToken(token);

    socket.data.user = {
      userId: new mongoose.Types.ObjectId(decoded.userId).toString(),
      email: decoded.email
    };

    next();
  } catch (error) {
    next(error as ExtendedError);
  }
};
