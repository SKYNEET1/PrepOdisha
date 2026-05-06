const mongoose = require("mongoose");
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");
const Course = require("../utils/courseRef");

/**
 * getRoomMessages
 * ──────────────────────────────────────────────────────────────
 * GET /api/v1/chat/messages/room/:roomId?page=1&limit=30
 *
 * Paginated message history for a group chat room.
 * Only members of the room can fetch messages.
 */
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    let room;
    if (mongoose.Types.ObjectId.isValid(roomId)) {
      room = await ChatRoom.findById(roomId);
    } else {
      room = await ChatRoom.findOne({ roomId });
    }

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Fetch messages, newest first, then reverse for chronological display
    const messages = await Message.find({ roomId: room._id, deletedAt: null })
      .populate("sender")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    messages.reverse();

    return res.status(200).json({ success: true, page, messages });
  } catch (error) {
    console.error("getRoomMessages error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * getDMHistory
 * ──────────────────────────────────────────────────────────────
 * GET /api/v1/chat/messages/dm/:otherUserId?page=1&limit=30
 *
 * Fetches private DM conversation between the logged-in user
 * and another student (identified by otherUserId).
 */
exports.getDMHistory = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    /**
     * A DM between A and B is stored as:
     *   { sender: A, dmTo: B } OR { sender: B, dmTo: A }
     * So we use $or to find messages in both directions.
     */
    const messages = await Message.find({
      deletedAt: null,
      $or: [
        { sender: userId, dmTo: otherUserId },
        { sender: otherUserId, dmTo: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    messages.reverse();

    return res.status(200).json({ success: true, page, messages });
  } catch (error) {
    console.error("getDMHistory error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * deleteMessage
 * ──────────────────────────────────────────────────────────────
 * DELETE /api/v1/chat/messages/:messageId
 *
 * Soft-delete: sets deletedAt timestamp.
 * Only the original sender can delete their own message.
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "You can only delete your own messages." });
    }

    message.deletedAt = new Date();
    await message.save();

    return res.status(200).json({ success: true, message: "Message deleted." });
  } catch (error) {
    console.error("deleteMessage error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * editMessage
 * ──────────────────────────────────────────────────────────────
 * PATCH /api/v1/chat/messages/:messageId
 * Body: { text }
 *
 * Only the original sender can edit their message.
 * Sets isEdited flag to true so the UI can show "(edited)" label.
 */
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text cannot be empty." });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "You can only edit your own messages." });
    }

    if (message.deletedAt) {
      return res.status(400).json({ success: false, message: "Cannot edit a deleted message." });
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("editMessage error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
