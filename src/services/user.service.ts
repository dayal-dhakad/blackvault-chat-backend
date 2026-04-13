import { FilterQuery, Types } from "mongoose";

import { User } from "../models/user.model";

export class UserService {
  static async getAllUsersExceptSelf(userId: Types.ObjectId) {
    return User.find({ _id: { $ne: userId } })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
  }

  static async searchUsers(userId: Types.ObjectId, query: string) {
    const filter: FilterQuery<typeof User> = {
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    };

    return User.find(filter).select("-password -refreshToken").limit(20).sort({ name: 1 });
  }
}
