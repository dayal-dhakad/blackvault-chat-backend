import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { SOCKET_EVENTS } from "../lib/constants";
import { MessageService } from "../services/message.service";
import { sendResponse } from "../utils/api-response";
import { getSocketServer } from "../socket/socket-state";

export class MessageController {
  static async getMessages(req: Request, res: Response) {
    const result = await MessageService.getConversationMessages(
      String(req.params.conversationId),
      req.user!.userId,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20
    );

    return sendResponse(
      res,
      StatusCodes.OK,
      "Messages fetched successfully",
      result.messages,
      result.pagination
    );
  }

  static async sendMessage(req: Request, res: Response) {
    const result = await MessageService.sendMessage({
      senderId: req.user!.userId,
      conversationId: req.body.conversationId,
      receiverId: req.body.receiverId,
      text: req.body.text,
      type: req.body.type
    });

    const io = getSocketServer();
    io.to(result.conversationId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, result.message);
    io.to(req.user!.userId.toString()).emit(SOCKET_EVENTS.CONVERSATION_UPDATED, {
      conversationId: result.conversationId
    });
    io.to(req.body.receiverId).emit(SOCKET_EVENTS.CONVERSATION_UPDATED, {
      conversationId: result.conversationId
    });

    return sendResponse(res, StatusCodes.CREATED, "Message sent successfully", result.message);
  }

  static async markRead(req: Request, res: Response) {
    const message = await MessageService.markMessageAsRead(
      String(req.params.messageId),
      req.user!.userId
    );
    const io = getSocketServer();

    if (message) {
      io.to(message.sender._id.toString()).emit(SOCKET_EVENTS.MESSAGE_READ, message);
      io.to(message.receiver._id.toString()).emit(SOCKET_EVENTS.MESSAGE_READ, message);
    }

    return sendResponse(res, StatusCodes.OK, "Message marked as read", message);
  }
}
