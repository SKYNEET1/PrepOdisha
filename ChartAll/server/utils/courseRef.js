/**
 * courseRef.js
 * ──────────────────────────────────────────────────────────────
 * Thin re-export of the PrepOdisha "Course" Mongoose model.
 * Same pattern as userRef.js — shares the DB, reads Course documents
 * to verify enrollment before allowing a student into a chat room.
 */
const mongoose = require("mongoose");

const Course =
  mongoose.models.Course ||
  mongoose.model(
    "Course",
    new mongoose.Schema(
      {
        courseName: String,
        studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        status: String,
      },
      { strict: false }
    )
  );

module.exports = Course;
