const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatUser",
      },
    ],
    chatAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatUser",
      },
    ],
    pinnedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
