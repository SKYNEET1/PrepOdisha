const mongoose = require("mongoose");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const ChatUser = require("../models/ChatUser");

/**
 * getOrCreateRoom
 * ──────────────────────────────────────────────────────────────
 * GET /api/v1/chat/rooms/:roomId
 *
 * For the global "Headline Chat" or any general room.
 */
exports.getOrCreateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Get the user's chat identity
    const chatUser = await ChatUser.findOne({ userId });
    if (!chatUser) {
       return res.status(403).json({ success: false, message: "User not synced with chat service" });
    }
    const chatUserId = chatUser._id;

    // ── Get or create the chat room ────────────────────────
    let room = await ChatRoom.findOne({ roomId });

    if (!room) {
      room = await ChatRoom.create({
        roomId,
        name: "Headline Chat",
        members: [chatUserId],
        chatAdmins: [],
      });
    } else {
      // Add student to members if not already there
      const alreadyMember = room.members.some((m) => m.toString() === chatUserId.toString());
      if (!alreadyMember) {
        room.members.push(chatUserId);
        await room.save();
      }
    }

    // ── Fetch last 30 messages for this room ───────────────
    const messages = await Message.find({ roomId: room._id, deletedAt: null })
      .populate("sender")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();  

    messages.reverse();

    return res.status(200).json({
      success: true,
      room: {
        _id: room._id,
        roomId: room.roomId,
        name: room.name,
        membersCount: room.members.length,
        chatAdmins: room.chatAdmins,
        pinnedMessage: room.pinnedMessage,
      },
      messages,
    });
  } catch (error) {
    console.error("getOrCreateRoom error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * getRoomMembers
 * ──────────────────────────────────────────────────────────────
 * GET /api/v1/chat/rooms/:roomId/members
 */
exports.getRoomMembers = async (req, res) => {
  try {
    const { roomId } = req.params;
    let room;
    if (mongoose.Types.ObjectId.isValid(roomId)) {
      room = await ChatRoom.findById(roomId).populate("members", "firstName lastName image accountType").lean();
    } else {
      room = await ChatRoom.findOne({ roomId }).populate("members", "firstName lastName image accountType").lean();
    }

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({ success: true, members: room.members });
  } catch (error) {
    console.error("getRoomMembers error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.promoteToAdmin = async (req, res) => {
    // simplified for brevity since it's an open chat
    return res.status(200).json({ success: true, message: "Action not supported in global chat." });
};

exports.kickMember = async (req, res) => {
    return res.status(200).json({ success: true, message: "Action not supported in global chat." });
};

exports.pinMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { messageId } = req.body;

    const room = await ChatRoom.findOneAndUpdate(
      { roomId },
      { pinnedMessage: messageId },
      { new: true }
    ).populate("pinnedMessage");

    return res.status(200).json({ success: true, pinnedMessage: room.pinnedMessage });
  } catch (error) {
    console.error("pinMessage error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
