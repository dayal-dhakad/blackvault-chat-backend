export type NodeEnv = "development" | "production" | "test";

export interface EnvConfig {
  PORT: number;
  NODE_ENV: NodeEnv;
  MONGODB_URI: string;
  CLIENT_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  BCRYPT_SALT_ROUNDS: number;
}
