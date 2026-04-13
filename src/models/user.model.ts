import { Model, Schema, Types, model } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserModel = Model<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    avatar: {
      type: String,
      trim: true
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date
    },
    refreshToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ email: 1 });
userSchema.index({ name: "text", email: "text" });

export const User = model<IUser, UserModel>("User", userSchema);
