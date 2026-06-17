import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.clientURL],
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const userConnections = {};

const userSocketMap = {};

const getOnlineUserIds = () =>
  Object.keys(userConnections).filter((id) => userConnections[id] > 0);

const broadcastOnlineUsers = () => {
  const onlineIds = getOnlineUserIds();
  io.emit("getOnlineUsers", onlineIds);
};

export function getReceiverSocketId(userId) {
  const id = userId?.toString();
  const sockets = userSocketMap[id];
  if (!sockets || sockets.size === 0) return null;
  return [...sockets][0];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;

  userConnections[userId] = (userConnections[userId] || 0) + 1;

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }
  userSocketMap[userId].add(socket.id);

  socket.emit("getOnlineUsers", getOnlineUserIds());
  socket.broadcast.emit("getOnlineUsers", getOnlineUserIds());

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);

    userConnections[userId] = Math.max(0, (userConnections[userId] || 1) - 1);
    if (userConnections[userId] === 0) {
      delete userConnections[userId];
    }

    if (userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }

    broadcastOnlineUsers();
  });

  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { userId: socket.userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { userId: socket.userId });
    }
  });
});

export { io, app, server };
