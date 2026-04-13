import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

import { env } from "../config/env";

interface TokenPayload {
  userId: string;
  email: string;
}

export interface DecodedToken extends JwtPayload, TokenPayload {}

const signToken = (
  payload: TokenPayload,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"]
): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateAccessToken = (payload: TokenPayload): string => {
  return signToken(payload, env.JWT_ACCESS_SECRET, env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return signToken(
    payload,
    env.JWT_REFRESH_SECRET,
    env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]
  );
};

export const verifyAccessToken = (token: string): DecodedToken => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
};

export const verifyRefreshToken = (token: string): DecodedToken => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedToken;
};
