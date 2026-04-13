import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { AuthService } from "../services/auth.service";
import { sendResponse } from "../utils/api-response";

export class AuthController {
  static async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);
    return sendResponse(res, StatusCodes.CREATED, "User registered successfully", result);
  }

  static async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body);
    return sendResponse(res, StatusCodes.OK, "Login successful", result);
  }

  static async refresh(req: Request, res: Response) {
    const result = await AuthService.refresh(req.body.refreshToken);
    return sendResponse(res, StatusCodes.OK, "Token refreshed successfully", result);
  }

  static async logout(req: Request, res: Response) {
    await AuthService.logout(req.user!.userId.toString(), req.body.refreshToken);
    return sendResponse(res, StatusCodes.OK, "Logout successful");
  }

  static async me(req: Request, res: Response) {
    const result = await AuthService.getCurrentUser(req.user!.userId.toString());
    return sendResponse(res, StatusCodes.OK, "Current user fetched successfully", result);
  }
}
