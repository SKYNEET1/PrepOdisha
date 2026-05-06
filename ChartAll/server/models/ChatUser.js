const mongoose = require("mongoose");

const chatUserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // StudyNotion's user ID
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    image: { type: String },
    accountType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatUser", chatUserSchema);
