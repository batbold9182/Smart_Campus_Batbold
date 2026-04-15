const express = require("express");
const Notification = require("../models/adminModels/notification.js");
const auth = require("../middleware/authMiddleware.js");

const router = express.Router();
// Get unread notifications count
router.get("/unread-count", auth, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });
    res.json({ unreadCount: count });
  } catch (err) {
    next(err);
  }
});

// Get logged-in user's notifications
router.get("/", auth, async (req, res, next) => {
  try {
    const filter = { recipient: req.user.id };
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;

    if (!hasPagination) {
      const notifications = await Notification.find(filter).sort({ createdAt: -1 });
      return res.json(notifications);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);

    res.json({
      items: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Mark as read
router.patch("/:id/read", auth, async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true
    });

    res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
