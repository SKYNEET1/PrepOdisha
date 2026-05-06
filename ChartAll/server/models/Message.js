const mongoose = require("mongoose");

/**
 * Message Schema
 * Stores every message sent in a room (group) or in a private DM.
 *
 * - roomId   → null for DMs; ObjectId of ChatRoom for group messages
 * - dmTo     → null for group messages; ObjectId of recipient for DMs
 * - isEdited → true when the sender edits the message
 * - deletedAt→ soft-delete: message hides from UI but stays in DB for audit
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",       // references Chat Service ChatUser model
      required: true,
    },
    senderName: { type: String, required: true },  // cached so queries are cheaper
    senderImage: { type: String, default: "" },    // cached avatar URL

    // ── Destination: exactly ONE of these will be set ──────────────
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      default: null,
    },
    dmTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",
      default: null,
    },
    // ───────────────────────────────────────────────────────────────

    text: { type: String, required: true, trim: true },

    isEdited: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }, // null = not deleted
  },
  { timestamps: true } // createdAt, updatedAt added automatically
);

module.exports = mongoose.model("Message", messageSchema);
