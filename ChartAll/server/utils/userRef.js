/**
 * userRef.js
 * ──────────────────────────────────────────────────────────────
 * Thin re-export of the PrepOdisha "user" Mongoose model.
 *
 * Because the chat service connects to the SAME MongoDB database
 * as PrepOdisha, it can register and query the same collections
 * directly. We re-register the model here so Mongoose doesn't
 * throw "Cannot overwrite model once compiled" if it was already
 * registered in the same process.
 *
 * If you ever run the chat service as a fully separate process
 * (different Node instance / different DB), replace this file
 * with an HTTP call to PrepOdisha's user API instead.
 */
const mongoose = require("mongoose");

// Re-use the existing model if already registered (safe for hot reload)
const User =
  mongoose.models.user ||
  mongoose.model(
    "user",
    new mongoose.Schema(
      {
        firstName: String,
        lastName: String,
        email: String,
        accountType: String,
        image: String,
        courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
      },
      { strict: false } // accept any extra fields from the PrepOdisha schema
    )
  );

module.exports = User;
