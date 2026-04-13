const userSockets = new Map<string, Set<string>>();

export const addUserSocket = (userId: string, socketId: string): void => {
  const existingSockets = userSockets.get(userId) ?? new Set<string>();
  existingSockets.add(socketId);
  userSockets.set(userId, existingSockets);
};

export const removeUserSocket = (userId: string, socketId: string): boolean => {
  const existingSockets = userSockets.get(userId);

  if (!existingSockets) {
    return false;
  }

  existingSockets.delete(socketId);

  if (existingSockets.size === 0) {
    userSockets.delete(userId);
    return true;
  }

  userSockets.set(userId, existingSockets);
  return false;
};

export const getUserSocketIds = (userId: string): string[] => {
  return Array.from(userSockets.get(userId) ?? []);
};

export const isUserOnline = (userId: string): boolean => {
  return userSockets.has(userId);
};
