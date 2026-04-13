import { Schema, Types, model } from "mongoose";

export interface IConversation {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export const Conversation = model<IConversation>("Conversation", conversationSchema);
