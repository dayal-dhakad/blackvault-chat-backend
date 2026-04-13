import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ConversationService } from "../services/conversation.service";
import { sendResponse } from "../utils/api-response";

export class ConversationController {
  static async accessConversation(req: Request, res: Response) {
    const conversation = await ConversationService.findOrCreateOneToOneConversation(
      req.user!.userId,
      req.body.targetUserId
    );

    return sendResponse(
      res,
      StatusCodes.OK,
      "Conversation accessed successfully",
      conversation
    );
  }

  static async getConversations(req: Request, res: Response) {
    const conversations = await ConversationService.getUserConversations(req.user!.userId);
    return sendResponse(
      res,
      StatusCodes.OK,
      "Conversations fetched successfully",
      conversations
    );
  }
}
