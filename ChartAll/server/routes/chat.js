const express = require("express");
const router = express.Router();

const { verifyToken, validateObjectId } = require("../middlewares/auth");
const roomController = require("../controllers/roomController");
const messageController = require("../controllers/messageController");
const syncController = require("../controllers/syncController");

// ══════════════════════════════════════════════════════════════
// SYNC ROUTE
// ══════════════════════════════════════════════════════════════
router.post("/sync-user", syncController.syncUser);

// ══════════════════════════════════════════════════════════════
// ROOM ROUTES
// ══════════════════════════════════════════════════════════════
router.get(
  "/rooms/:roomId",
  verifyToken,
  roomController.getOrCreateRoom
);

router.get(
  "/rooms/:roomId/members",
  verifyToken,
  roomController.getRoomMembers
);

// ══════════════════════════════════════════════════════════════
// MESSAGE ROUTES
// ══════════════════════════════════════════════════════════════
router.get(
  "/messages/room/:roomId",
  verifyToken,
  messageController.getRoomMessages
);

router.get(
  "/messages/dm/:otherUserId",
  verifyToken,
  messageController.getDMHistory
);

router.patch(
  "/messages/:messageId",
  verifyToken,
  validateObjectId(["messageId"]),
  messageController.editMessage
);

router.delete(
  "/messages/:messageId",
  verifyToken,
  validateObjectId(["messageId"]),
  messageController.deleteMessage
);

module.exports = router;
