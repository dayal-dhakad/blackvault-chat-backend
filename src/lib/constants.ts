export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

export const SOCKET_EVENTS = {
  CONNECTED: "connected",
  SETUP: "setup",
  JOIN_CONVERSATION: "join_conversation",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  TYPING: "typing",
  STOP_TYPING: "stop_typing",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  MARK_READ: "mark_read",
  MESSAGE_READ: "message_read",
  CONVERSATION_UPDATED: "conversation_updated"
} as const;

export const MESSAGE_TYPES = ["text"] as const;
