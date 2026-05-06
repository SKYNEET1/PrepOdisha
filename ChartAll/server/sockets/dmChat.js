const mongoose = require("mongoose");
const Message = require("../models/Message");
const ChatUser = require("../models/ChatUser");
const onlineUsers = require("../utils/onlineUsers");

/**
 * dmSocket
 * ──────────────────────────────────────────────────────────────
 * Handles real-time Private (1-to-1) Direct Messages between students.
 *
 * Namespace: /dm
 *
 * Events (client → server):
 *   sendDM         { toUserId, text }                – send a private message
 *   typing         { toUserId }                      – typing indicator to recipient
 *   stopTyping     { toUserId }                      – stop typing signal
 *   editDM         { messageId, newText }            – edit own DM
 *   deleteDM       { messageId }                     – soft-delete own DM
 *
 * Events (server → client):
 *   dm             { message }                       – incoming DM
 *   dmEdited       { messageId, newText }            – edit notification
 *   dmDeleted      { messageId }                     – delete notification
 *   userTyping     { userId, name }                  – typing indicator
 *   userStopTyping { userId }                        – stop typing
 *   error          { message }
 */
module.exports = function dmSocket(io) {
  const dm = io.of("/dm");

  const socketAuth = require("../middlewares/socketAuth");
  dm.use(socketAuth);

  dm.on("connection", async (socket) => {
    const user = socket.data.user;
    console.log(`[DM] ${user.id} connected (socket: ${socket.id})`);

    let userDoc;
    try {
      userDoc = await ChatUser.findOne({ userId: user.id }).lean();
      if (!userDoc) {
        console.warn(`[DM] User ${user.id} not found in database.`);
        socket.emit("error", { message: "User profile not found. Please log in again." });
        return socket.disconnect();
      }
    } catch (e) {
      socket.emit("error", { message: "Failed to fetch user info" });
      return socket.disconnect();
    }

    const displayName = `${userDoc.firstName} ${userDoc.lastName}`;
    const chatUserId = userDoc._id.toString();
    socket.data.chatUserId = chatUserId;

    console.log("[IDENTITY SYNC]", {
      authUserId: user.id,
      chatUserId,
      socketId: socket.id
    });

    onlineUsers.setOnline(chatUserId, socket.id);

    // ── sendDM ───────────────────────────────────────────────
    socket.on("sendDM", async ({ toUserId, text }) => {
      try {
        if (!text || !text.trim()) return;
        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
          return socket.emit("error", { message: "Invalid recipient ID format" });
        }

        // Validate recipient exists
        // toUserId passed from client is expected to be ChatUser._id now.
        const recipient = await ChatUser.findById(toUserId).lean();
        if (!recipient) {
          return socket.emit("error", { message: "Recipient not found" });
        }

        // Instructors cannot receive DMs from students in this chat system
        // (They are already blocked from connecting, but double-check recipient)
        if (recipient.accountType === "Instructor") {
          return socket.emit("error", {
            message: "You cannot send a direct message to an instructor.",
          });
        }

        // Persist the DM
        let message = await Message.create({
          sender: chatUserId,
          senderName: displayName,
          senderImage: userDoc.image || "",
          dmTo: toUserId,
          text: text.trim(),
        });
        message = await message.populate("sender");

        /**
         * Delivery strategy:
         * - If recipient is online → emit to their specific socket
         * - Always emit back to sender so their own UI updates
         *
         * Note: We use onlineUsers map (userId → socketId) to find
         * the recipient's socket ID and emit directly to it.
         */
        const recipientSocketId = onlineUsers.getSocketId(toUserId);
        if (recipientSocketId) {
          // Send to recipient's socket directly
          dm.to(recipientSocketId).emit("dm", message);
        }
        // Confirm delivery to sender
        socket.emit("dm", message);
      } catch (err) {
        console.error("[DM] sendDM error:", err);
        socket.emit("error", { message: "Failed to send DM" });
      }
    });

    // ── typing indicators ────────────────────────────────────
    socket.on("typing", ({ toUserId }) => {
      const recipientSocketId = onlineUsers.getSocketId(toUserId);
      if (recipientSocketId) {
        dm.to(recipientSocketId).emit("userTyping", { userId: chatUserId, name: displayName });
      }
    });

    socket.on("stopTyping", ({ toUserId }) => {
      const recipientSocketId = onlineUsers.getSocketId(toUserId);
      if (recipientSocketId) {
        dm.to(recipientSocketId).emit("userStopTyping", { userId: chatUserId });
      }
    });

    // ── editDM ───────────────────────────────────────────────
    socket.on("editDM", async ({ messageId, newText }) => {
      try {
        if (!newText || !newText.trim()) return;

        const message = await Message.findById(messageId);
        if (!message || message.deletedAt) return;
        if (message.sender.toString() !== chatUserId) {
          return socket.emit("error", { message: "Cannot edit someone else's DM" });
        }

        message.text = newText.trim();
        message.isEdited = true;
        await message.save();

        // Notify both sender and recipient
        const recipientSocketId = onlineUsers.getSocketId(message.dmTo.toString());
        if (recipientSocketId) {
          dm.to(recipientSocketId).emit("dmEdited", { messageId, newText: message.text });
        }
        socket.emit("dmEdited", { messageId, newText: message.text });
      } catch (err) {
        console.error("[DM] editDM error:", err);
        socket.emit("error", { message: "Failed to edit DM" });
      }
    });

    // ── deleteDM ─────────────────────────────────────────────
    socket.on("deleteDM", async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.deletedAt) return;
        if (message.sender.toString() !== chatUserId) {
          return socket.emit("error", { message: "Cannot delete someone else's DM" });
        }

        message.deletedAt = new Date();
        await message.save();

        const recipientSocketId = onlineUsers.getSocketId(message.dmTo.toString());
        if (recipientSocketId) {
          dm.to(recipientSocketId).emit("dmDeleted", { messageId });
        }
        socket.emit("dmDeleted", { messageId });
      } catch (err) {
        console.error("[DM] deleteDM error:", err);
        socket.emit("error", { message: "Failed to delete DM" });
      }
    });

    // ── disconnect ───────────────────────────────────────────
    socket.on("disconnect", () => {
      onlineUsers.setOffline(chatUserId);
      console.log(`[DM] ${displayName} disconnected`);
    });
  });
};
