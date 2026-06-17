export const isUserOnline = (userId, onlineUsers) => {
  if (!userId || !onlineUsers?.length) return false;
  const id = String(userId?._id || userId);
  return onlineUsers.map(String).includes(id);
};
