import { Server } from "socket.io";

let ioInstance: Server | null = null;

export const setSocketServer = (io: Server): void => {
  ioInstance = io;
};

export const getSocketServer = (): Server => {
  if (!ioInstance) {
    throw new Error("Socket.IO server has not been initialized");
  }

  return ioInstance;
};
