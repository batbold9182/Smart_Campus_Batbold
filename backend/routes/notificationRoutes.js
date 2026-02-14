const express = require("express");
const Notification = require("../models/notification.js");
const auth = require("../middleware/authMiddleware.js");

const router = express.Router();

// Get logged-in user's notifications
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true
    });

    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
