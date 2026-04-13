import { Schema, Types, model } from "mongoose";

import { MESSAGE_TYPES } from "../lib/constants";

export interface IMessage {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  text: string;
  type: (typeof MESSAGE_TYPES)[number];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    type: {
      type: String,
      enum: MESSAGE_TYPES,
      default: "text"
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

export const Message = model<IMessage>("Message", messageSchema);
