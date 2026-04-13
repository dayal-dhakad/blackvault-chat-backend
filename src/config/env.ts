import dotenv from "dotenv";
import { z } from "zod";

import { EnvConfig } from "../types/env";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLIENT_URL: z.string().min(1, "CLIENT_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1, "ACCESS_TOKEN_EXPIRES_IN is required"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().min(1, "REFRESH_TOKEN_EXPIRES_IN is required"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment variables:\n${issues.join("\n")}`);
}

export const env: EnvConfig = parsedEnv.data;
