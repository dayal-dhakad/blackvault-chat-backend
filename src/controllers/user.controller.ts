import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { UserService } from "../services/user.service";
import { sendResponse } from "../utils/api-response";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    const users = await UserService.getAllUsersExceptSelf(req.user!.userId);
    return sendResponse(res, StatusCodes.OK, "Users fetched successfully", users);
  }

  static async searchUsers(req: Request, res: Response) {
    const users = await UserService.searchUsers(req.user!.userId, req.query.q as string);
    return sendResponse(res, StatusCodes.OK, "Search results fetched successfully", users);
  }
}
