const onlineUsers = require("../utils/onlineUsers");

/**
 * presenceSocket
 * ──────────────────────────────────────────────────────────────
 * Namespace: /presence
 *
 * Broadcasts online/offline status changes to all connected clients.
 * Frontend can use this to show green dots next to online users.
 *
 * Events (server → client):
 *   onlineUsers    { userIds: string[] }  – sent on connect: full list of who's online
 *   userOnline     { userId: string }     – someone just came online
 *   userOffline    { userId: string }     – someone just went offline
 */
module.exports = function presenceSocket(io) {
  const presence = io.of("/presence");

  const socketAuth = require("../middlewares/socketAuth");
  presence.use(socketAuth);

  presence.on("connection", async (socket) => {
    const user = socket.data.user;
    const ChatUser = require("../models/ChatUser");
    let userDoc;
    try {
      userDoc = await ChatUser.findOne({ userId: user.id }).lean();
      if (!userDoc) return socket.disconnect();
    } catch (e) {
      return socket.disconnect();
    }
    const chatUserId = userDoc._id.toString();

    onlineUsers.setOnline(chatUserId, socket.id);

    // Send the full online list to the newly connected client
    socket.emit("onlineUsers", { userIds: onlineUsers.getAllOnline() });

    // Announce to everyone else that this user is now online
    socket.broadcast.emit("userOnline", { userId: chatUserId });

    socket.on("disconnect", () => {
      onlineUsers.setOffline(chatUserId);
      // Announce offline to all remaining clients
      socket.broadcast.emit("userOffline", { userId: chatUserId });
    });
  });
};
