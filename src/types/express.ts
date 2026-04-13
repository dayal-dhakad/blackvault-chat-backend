import { Types } from "mongoose";

export interface AuthenticatedUser {
  userId: Types.ObjectId;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
