import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { User } from "../models/user.model";
import { AppError } from "../utils/app-error";
import { getPagination } from "../utils/pagination";
import { ConversationService } from "./conversation.service";

type PopulatedMessage = {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
  };
  receiver: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: Date;
  };
  text: string;
  type: "text";
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class MessageService {
  static async getConversationMessages(
    conversationId: string,
    userId: Types.ObjectId,
    page?: number,
    limit?: number
  ) {
    await ConversationService.ensureConversationAccess(conversationId, userId);

    const pagination = getPagination({ page, limit });

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate("sender", "name email avatar isOnline lastSeen")
        .populate("receiver", "name email avatar isOnline lastSeen")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Message.countDocuments({ conversation: conversationId })
    ]);

    return {
      messages: messages.reverse(),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  }

  static async sendMessage(payload: {
    senderId: Types.ObjectId;
    receiverId: string;
    text: string;
    type?: "text";
    conversationId?: string;
  }) {
    if (payload.senderId.toString() === payload.receiverId) {
      throw new AppError("You cannot message yourself", StatusCodes.BAD_REQUEST);
    }

    const receiver = await User.findById(payload.receiverId);

    if (!receiver) {
      throw new AppError("Receiver not found", StatusCodes.NOT_FOUND);
    }

    let conversation;

    if (payload.conversationId) {
      conversation = await ConversationService.ensureConversationAccess(
        payload.conversationId,
        payload.senderId
      );

      const isReceiverParticipant = conversation.participants.some(
        (participantId) => participantId.toString() === payload.receiverId
      );

      if (!isReceiverParticipant) {
        throw new AppError("Receiver is not part of this conversation", StatusCodes.BAD_REQUEST);
      }
    } else {
      conversation = await Conversation.findOne({
        participants: {
          $all: [payload.senderId, receiver._id],
          $size: 2
        }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [payload.senderId, receiver._id]
        });
      }
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: payload.senderId,
      receiver: receiver._id,
      text: payload.text.trim(),
      type: payload.type ?? "text"
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = (await Message.findById(message._id)
      .populate("sender", "name email avatar isOnline lastSeen")
      .populate("receiver", "name email avatar isOnline lastSeen")) as PopulatedMessage | null;

    return {
      message: populatedMessage,
      conversationId: conversation._id.toString()
    };
  }

  static async markMessageAsRead(messageId: string, userId: Types.ObjectId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError("Message not found", StatusCodes.NOT_FOUND);
    }

    if (message.receiver.toString() !== userId.toString()) {
      throw new AppError("You can only mark your own received messages as read", StatusCodes.FORBIDDEN);
    }

    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    return (await Message.findById(message._id)
      .populate("sender", "name email avatar isOnline lastSeen")
      .populate("receiver", "name email avatar isOnline lastSeen")) as PopulatedMessage | null;
  }
}
