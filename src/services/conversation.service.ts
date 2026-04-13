import { PipelineStage, Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { Conversation } from "../models/conversation.model";
import { User } from "../models/user.model";
import { AppError } from "../utils/app-error";

export const buildConversationPipeline = (userId: Types.ObjectId): PipelineStage[] => [
  {
    $match: {
      participants: userId
    }
  },
  {
    $lookup: {
      from: "messages",
      localField: "lastMessage",
      foreignField: "_id",
      as: "lastMessage"
    }
  },
  {
    $unwind: {
      path: "$lastMessage",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "participants",
      foreignField: "_id",
      as: "participants"
    }
  },
  {
    $addFields: {
      participants: {
        $map: {
          input: {
            $filter: {
              input: "$participants",
              as: "participant",
              cond: { $ne: ["$$participant._id", userId] }
            }
          },
          as: "participant",
          in: {
            id: "$$participant._id",
            name: "$$participant.name",
            email: "$$participant.email",
            avatar: "$$participant.avatar",
            isOnline: "$$participant.isOnline",
            lastSeen: "$$participant.lastSeen",
            createdAt: "$$participant.createdAt",
            updatedAt: "$$participant.updatedAt"
          }
        }
      }
    }
  },
  {
    $lookup: {
      from: "messages",
      let: { conversationId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$conversation", "$$conversationId"] },
                { $eq: ["$receiver", userId] },
                { $eq: ["$isRead", false] }
              ]
            }
          }
        },
        { $count: "count" }
      ],
      as: "unreadMeta"
    }
  },
  {
    $addFields: {
      unreadCount: {
        $ifNull: [{ $arrayElemAt: ["$unreadMeta.count", 0] }, 0]
      }
    }
  },
  {
    $project: {
      unreadMeta: 0
    }
  },
  {
    $sort: {
      updatedAt: -1
    }
  }
];

export class ConversationService {
  static async findOrCreateOneToOneConversation(userId: Types.ObjectId, targetUserId: string) {
    if (userId.toString() === targetUserId) {
      throw new AppError("You cannot start a conversation with yourself", StatusCodes.BAD_REQUEST);
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      throw new AppError("Target user not found", StatusCodes.NOT_FOUND);
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [userId, targetUser._id],
        $size: 2
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, targetUser._id]
      });
    }

    const [formattedConversation] = await Conversation.aggregate([
      { $match: { _id: conversation._id } },
      ...buildConversationPipeline(userId)
    ]);

    return formattedConversation;
  }

  static async getUserConversations(userId: Types.ObjectId) {
    return Conversation.aggregate(buildConversationPipeline(userId));
  }

  static async getConversationSummary(conversationId: Types.ObjectId, userId: Types.ObjectId) {
    const [conversation] = await Conversation.aggregate([
      { $match: { _id: conversationId } },
      ...buildConversationPipeline(userId)
    ]);

    return conversation;
  }

  static async ensureConversationAccess(conversationId: string, userId: Types.ObjectId) {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found", StatusCodes.NOT_FOUND);
    }

    const hasAccess = conversation.participants.some(
      (participantId) => participantId.toString() === userId.toString()
    );

    if (!hasAccess) {
      throw new AppError("You are not allowed to access this conversation", StatusCodes.FORBIDDEN);
    }

    return conversation;
  }
}
