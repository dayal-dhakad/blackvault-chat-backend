import { Server, Socket } from "socket.io";

export interface SocketUser {
  userId: string;
  email: string;
}

export interface AuthenticatedSocket extends Socket {
  data: Socket["data"] & {
    user?: SocketUser;
  };
}

export interface SocketServer extends Server {}
