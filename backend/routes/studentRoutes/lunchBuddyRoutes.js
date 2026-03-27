const express = require("express");
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");
const LunchBuddyMessage = require("../../models/lunchBuddyMessage");

const router = express.Router();

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const formatMessage = (message) => ({
  id: String(message._id),
  text: message.text,
  createdAt: message.createdAt,
  sender: {
    id: message.sender?._id ? String(message.sender._id) : "",
    name: message.sender?.name || "Student",
    program: message.sender?.program || null,
    yearLevel: message.sender?.yearLevel ?? null,
    profile: message.sender?.profile || "defaultProfile.png",
  },
});

router.get("/messages", auth, role("student"), async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.floor(requestedLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

    const messages = await LunchBuddyMessage.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name program yearLevel profile")
      .lean();

    res.json({
      messages: messages.reverse().map(formatMessage),
    });
  } catch (err) {
    console.error("LUNCH_BUDDY_HISTORY_ERROR:", err);
    res.status(500).json({ message: "Failed to load Lunch Buddy messages" });
  }
});

module.exports = router;