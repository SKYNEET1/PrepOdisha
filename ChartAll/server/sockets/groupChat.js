const mongoose = require("mongoose");
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const ChatUser = require("../models/ChatUser");
const onlineUsers = require("../utils/onlineUsers");

module.exports = function groupChatSocket(io) {
  const group = io.of("/group");
  const socketAuth = require("../middlewares/socketAuth");
  group.use(socketAuth);

  group.on("connection", async (socket) => {
    const user = socket.data.user;
    console.log(`[Socket: ${socket.id}] User connected: ${user.email} (${user.id})`);
    
    const displayName = `${user.firstName || 'User'} ${user.lastName || ""}`.trim();
    const chatUserId = user.id;
    socket.data.chatUserId = chatUserId;

    console.log(`[Socket: ${socket.id}] Using simple identity: ${displayName} (${chatUserId})`);
    onlineUsers.setOnline(chatUserId, socket.id);

    socket.on("joinRoom", async ({ roomId }, callback) => {
      console.log(`[Socket: ${socket.id}] [joinRoom] request for: ${roomId}`);
      try {
        let room;
        if (mongoose.Types.ObjectId.isValid(roomId)) {
          room = await ChatRoom.findById(roomId);
        } else {
          room = await ChatRoom.findOne({ roomId });
        }

        if (!room) {
          console.error(`[Socket: ${socket.id}] Room not found: ${roomId}`);
          socket.emit("error", { message: "Room not found" });
          if (callback) callback({ error: "Room not found" });
          return;
        }

        const roomJoinId = room._id.toString();
        socket.join(roomJoinId);
        console.log(`[JOIN SUCCESS] ${displayName} joined room ${roomJoinId}`);
        
        socket.to(roomJoinId).emit("userJoined", { userId: chatUserId, name: displayName });
        if (callback) callback({ success: true, roomId: roomJoinId });
      } catch (err) {
        console.error(`[Socket: ${socket.id}] Error in joinRoom:`, err);
        socket.emit("error", { message: "Could not join room" });
        if (callback) callback({ error: "Server error" });
      }
    });

    socket.on("sendMessage", async ({ roomId, text }, callback) => {
      console.log(`[Socket: ${socket.id}] sendMessage to room ${roomId}: "${text.substring(0, 20)}..."`);
      try {
        if (!text || !text.trim()) return;

        let room;
        if (mongoose.Types.ObjectId.isValid(roomId)) {
          room = await ChatRoom.findById(roomId);
        } else {
          room = await ChatRoom.findOne({ roomId });
        }

        if (!room) {
          console.error(`[Socket: ${socket.id}] Room not found during sendMessage: ${roomId}`);
          if (typeof callback === 'function') callback({ error: "Room not found" });
          return;
        }

        let message = await Message.create({
          sender: chatUserId,
          senderName: displayName,
          senderImage: user.image || "",
          roomId: room._id,
          text: text.trim(),
        });

        // Skip populate to avoid ChatUser dependency.
        // message = await message.populate("sender");
        
        const roomBroadcastId = room._id.toString();
        const socketsInRoom = await group.in(roomBroadcastId).fetchSockets();
        console.log(`[Socket: ${socket.id}] [sendMessage] Room ${roomBroadcastId} has ${socketsInRoom.length} sockets connected.`);
        console.log(`[Socket: ${socket.id}] [sendMessage] Broadcasting message ${message._id} to room ${roomBroadcastId}`);
        
        const messageJSON = message.toJSON();
        
        group.to(roomBroadcastId).emit("message", messageJSON);
        console.log(`[Socket: ${socket.id}] [sendMessage] Broadcast EMITTED to room ${roomBroadcastId}`);
        
        if (typeof callback === 'function') {
           console.log(`[Socket: ${socket.id}] Sending acknowledgment for message ${message._id}`);
           callback({ success: true, message: messageJSON });
        }
      } catch (err) {
        console.error(`[Socket: ${socket.id}] Error in sendMessage:`, err);
        if (typeof callback === 'function') callback({ error: "Failed to send" });
      }
    });

    socket.on("typing", ({ roomId }) => {
      socket.to(roomId).emit("userTyping", { userId: chatUserId, name: displayName, roomId });
    });

    socket.on("stopTyping", ({ roomId }) => {
      socket.to(roomId).emit("userStopTyping", { userId: chatUserId, roomId });
    });

    socket.on("editMessage", async ({ messageId, newText }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== chatUserId) return;
        message.text = newText.trim();
        message.isEdited = true;
        await message.save();
        group.to(message.roomId.toString()).emit("messageEdited", { messageId, newText: message.text, roomId: message.roomId });
      } catch (err) {}
    });

    socket.on("deleteMessage", async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.sender.toString() !== chatUserId) return;
        message.deletedAt = new Date();
        await message.save();
        group.to(message.roomId.toString()).emit("messageDeleted", { messageId, roomId: message.roomId });
      } catch (err) {}
    });

    socket.on("disconnect", () => {
      console.log(`[Socket: ${socket.id}] User disconnected: ${displayName} (Reason: transport close)`);
      onlineUsers.setOffline(chatUserId);
    });
  });
};
