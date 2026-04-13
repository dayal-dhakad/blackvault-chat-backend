import mongoose from "mongoose";

import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
  // Confirms the database connection during server startup.
  console.log("MongoDB connected successfully");
};
