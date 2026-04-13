import http from "http";

import { app } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { initializeSocket } from "./socket";

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
};

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
