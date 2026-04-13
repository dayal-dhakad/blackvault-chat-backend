import bcrypt from "bcryptjs";

import { env } from "../config/env";

export const hashPassword = async (value: string): Promise<string> => {
  return bcrypt.hash(value, env.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (value: string, hashedValue: string): Promise<boolean> => {
  return bcrypt.compare(value, hashedValue);
};
