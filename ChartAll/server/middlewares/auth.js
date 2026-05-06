const jwt = require("jsonwebtoken");

/**
 * verifyToken
 * ──────────────────────────────────────────────────────────────
 * Verifies the JWT issued by PrepOdisha's auth system.
 * The secret (JWT_KEY) MUST be the same in both services.
 *
 * Token can arrive via:
 *   1. Cookie  (req.cookies.token)
 *   2. Body    (req.body.token)
 *   3. Header  (Authorization: Bearer <token>)
 */
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    let token =
      req.cookies?.token ||
      req.body?.token ||
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

    // Guard: treat string "undefined"/"null" as missing token
    if (token === "undefined" || token === "null") token = null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // PrepOdisha generates tokens with _id field; normalise to id
    if (decoded._id && !decoded.id) decoded.id = decoded._id;

    req.user = decoded; // { id, email, accountType }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/**
 * isStudentOrAdmin
 * ──────────────────────────────────────────────────────────────
 * Instructors are NOT allowed to access chat routes.
 * Only Students and OdishaPrep Admins can proceed.
 */
exports.isStudentOrAdmin = (req, res, next) => {
  if (req.user.accountType === "Instructor") {
    return res.status(403).json({
      success: false,
      message: "Instructors are not allowed to access the student chat.",
    });
  }
  next();
};

/**
 * isChatAdmin
 * ──────────────────────────────────────────────────────────────
 * Used for admin-only chat actions (kick, promote, pin).
 * Checks whether the requesting user is listed in the room's chatAdmins array.
 * Must be used AFTER verifyToken.
 *
 * NOTE: The ChatRoom document must be attached to req.room before this runs.
 * Use this after a middleware that fetches the room.
 */
exports.isChatAdmin = (req, res, next) => {
  const room = req.room; // attached by fetchRoom middleware
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }

  // Check if the user's id is in chatAdmins list
  const isAdmin = room.chatAdmins.some(
    (adminId) => adminId.toString() === req.user.id
  );

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Only chat admins can perform this action.",
    });
  }
  next();
};

/**
 * validateObjectId
 * ──────────────────────────────────────────────────────────────
 * Checks if provided params/body IDs are valid MongoDB ObjectIds.
 * Prevents CastError: Cast to ObjectId failed for value "demo1".
 */
const mongoose = require("mongoose");
exports.validateObjectId = (paramsToStyles = ["id", "roomId", "courseId", "messageId", "otherUserId", "targetUserId"]) => {
  return (req, res, next) => {
    for (const key of paramsToStyles) {
      const value = req.params[key] || req.body[key] || req.query[key];
      if (value) {
        // Special case: allow demo IDs or custom string identifiers for rooms/courses
        // since we have findOne() fallbacks in the controllers.
        if ((key === "roomId" || key === "courseId") && typeof value === "string") {
          continue; 
        }

        if (!mongoose.Types.ObjectId.isValid(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ID format for ${key}`,
          });
        }
      }
    }
    next();
  };
};
