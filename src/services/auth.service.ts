import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

import { User } from "../models/user.model";
import { AppError } from "../utils/app-error";
import { comparePassword, hashPassword } from "../utils/password";
import {
  DecodedToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/jwt";

const sanitizeUser = (user: {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  isOnline: user.isOnline,
  lastSeen: user.lastSeen,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const buildAuthResponse = (user: {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}) => {
  const payload = { userId: user._id.toString(), email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: sanitizeUser(user),
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

export class AuthService {
  static async register(payload: {
    name: string;
    email: string;
    password: string;
    avatar?: string;
  }) {
    const existingUser = await User.findOne({ email: payload.email.toLowerCase() });

    if (existingUser) {
      throw new AppError("Email is already registered", StatusCodes.CONFLICT);
    }

    const password = await hashPassword(payload.password);
    const user = await User.create({
      ...payload,
      email: payload.email.toLowerCase(),
      password
    });

    const authData = buildAuthResponse(user);
    user.refreshToken = authData.tokens.refreshToken;
    await user.save();

    return authData;
  }

  static async login(payload: { email: string; password: string }) {
    const user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const isPasswordValid = await comparePassword(payload.password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
    }

    const authData = buildAuthResponse(user);
    user.refreshToken = authData.tokens.refreshToken;
    await user.save();

    return authData;
  }

  static async refresh(refreshToken: string) {
    let decoded: DecodedToken;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (_error) {
      throw new AppError("Invalid or expired refresh token", StatusCodes.UNAUTHORIZED);
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      throw new AppError("Refresh token is no longer valid", StatusCodes.UNAUTHORIZED);
    }

    const authData = buildAuthResponse(user);
    user.refreshToken = authData.tokens.refreshToken;
    await user.save();

    return authData;
  }

  static async logout(userId: string, refreshToken?: string) {
    const user = await User.findById(userId);

    if (!user) {
      return;
    }

    if (refreshToken && user.refreshToken && user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token for logout", StatusCodes.UNAUTHORIZED);
    }

    user.refreshToken = null;
    await user.save();
  }

  static async getCurrentUser(userId: string) {
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new AppError("User not found", StatusCodes.NOT_FOUND);
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
