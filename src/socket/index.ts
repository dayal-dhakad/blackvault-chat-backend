import { Server as HttpServer } from "http";
import { Types } from "mongoose";
import { Server } from "socket.io";

import { env } from "../config/env";
import { SOCKET_EVENTS } from "../lib/constants";
import { User } from "../models/user.model";
import { MessageService } from "../services/message.service";
import { AuthenticatedSocket } from "../types/socket";
import { socketAuthMiddleware } from "./socket-auth";
import { addUserSocket, getUserSocketIds, removeUserSocket } from "./presence";
import { setSocketServer } from "./socket-state";

const emitSocketError = (socket: AuthenticatedSocket, error: unknown): void => {
  const message = error instanceof Error ? error.message : "Socket event failed";
  socket.emit("error", { message });
};

export const initializeSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true
    }
  });

  io.use(socketAuthMiddleware);
  setSocketServer(io);

  io.on("connection", async (socket: AuthenticatedSocket) => {
    const user = socket.data.user;

    if (!user) {
      socket.disconnect();
      return;
    }

    addUserSocket(user.userId, socket.id);
    socket.join(user.userId);
    await User.findByIdAndUpdate(user.userId, { isOnline: true });

    socket.emit(SOCKET_EVENTS.CONNECTED, {
      userId: user.userId
    });

    socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, {
      userId: user.userId
    });

    socket.on(SOCKET_EVENTS.SETUP, () => {
      socket.emit(SOCKET_EVENTS.CONNECTED, { userId: user.userId });
    });

    socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on(
      SOCKET_EVENTS.SEND_MESSAGE,
      async (payload: { conversationId?: string; receiverId: string; text: string; type?: "text" }) => {
        try {
          const result = await MessageService.sendMessage({
            senderId: new Types.ObjectId(user.userId),
            conversationId: payload.conversationId,
            receiverId: payload.receiverId,
            text: payload.text,
            type: payload.type
          });

          io.to(result.conversationId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, result.message);
          io.to(user.userId).emit(SOCKET_EVENTS.CONVERSATION_UPDATED, {
            conversationId: result.conversationId
          });
          io.to(payload.receiverId).emit(SOCKET_EVENTS.CONVERSATION_UPDATED, {
            conversationId: result.conversationId
          });
        } catch (error) {
          emitSocketError(socket, error);
        }
      }
    );

    socket.on(
      SOCKET_EVENTS.TYPING,
      (payload: { conversationId: string; targetUserId: string }) => {
        getUserSocketIds(payload.targetUserId).forEach((socketId) => {
          io.to(socketId).emit(SOCKET_EVENTS.TYPING, {
            conversationId: payload.conversationId,
            userId: user.userId
          });
        });
      }
    );

    socket.on(
      SOCKET_EVENTS.STOP_TYPING,
      (payload: { conversationId: string; targetUserId: string }) => {
        getUserSocketIds(payload.targetUserId).forEach((socketId) => {
          io.to(socketId).emit(SOCKET_EVENTS.STOP_TYPING, {
            conversationId: payload.conversationId,
            userId: user.userId
          });
        });
      }
    );

    socket.on(SOCKET_EVENTS.MARK_READ, async (payload: { messageId: string; senderId: string }) => {
      try {
        const message = await MessageService.markMessageAsRead(
          payload.messageId,
          new Types.ObjectId(user.userId)
        );

        io.to(payload.senderId).emit(SOCKET_EVENTS.MESSAGE_READ, message);
        io.to(user.userId).emit(SOCKET_EVENTS.MESSAGE_READ, message);
      } catch (error) {
        emitSocketError(socket, error);
      }
    });

    socket.on("disconnect", async () => {
      const isLastSocket = removeUserSocket(user.userId, socket.id);

      if (isLastSocket) {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(user.userId, {
          isOnline: false,
          lastSeen
        });

        socket.broadcast.emit(SOCKET_EVENTS.USER_OFFLINE, {
          userId: user.userId,
          lastSeen
        });
      }
    });
  });

  return io;
};
