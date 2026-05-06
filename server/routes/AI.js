const express = require("express");
const router = express.Router();
const { askAI } = require("../controllers/AI/aiController");
const { auth } = require("../middlewares/auth");

// Route to handle AI queries
// We can make it public or authenticated based on preference, here using auth for security
router.post("/ask", askAI);

module.exports = router;
