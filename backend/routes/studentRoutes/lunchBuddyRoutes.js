const express = require("express");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");
const LunchBuddyMessage = require("../../models/studentModels/lunchBuddyMessage");

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

router.get("/messages", auth, authorizeRoles("student"), async (req, res, next) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.floor(requestedLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;

    // Cursor-based pagination: ?before=<messageId> loads messages older than that ID
    const beforeId = typeof req.query.before === "string" ? req.query.before.trim() : null;
    const filter = beforeId ? { _id: { $lt: beforeId } } : {};

    const messages = await LunchBuddyMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "name program yearLevel profile")
      .lean();

    res.json({
      messages: messages.reverse().map(formatMessage),
      hasMore: messages.length === limit,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;