const express = require("express");
const Notification = require("../models/notification.js");
const auth = require ("../middleware/authMiddleware.js");
const authorizeRoles = require("../middleware/roleMiddleware");
const user = require("../models/user.js");

const router = express.Router();

/**
 * Admin → Send notification
 */
router.post(
  "/notify",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { title, message, recipients, type } = req.body;

      if (!recipients || recipients.length === 0) {
        return res.status(400).json({ message: "Recipients required" });
      }

      const notifications = await Notification.insertMany(
        recipients.map((userId) => ({
          title,
          message,
          recipient: userId,
          type
        }))
      );

      res.json({
        message: "Notifications sent",
        count: notifications.length
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  "/notify",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { title, message, target, userId } = req.body;

      let recipients = [];

      if (target === "all") {
        recipients = await user.find();
      }

      if (target === "students") {
        recipients = await user.find({ role: "student" });
      }

      if (target === "faculty") {
        recipients = await user.find({ role: "faculty" });
      }

      if (target === "single" && userId) {
        const singleUser = await user.findById(userId);
        if (!singleUser) {
          return res.status(404).json({ message: "User not found" });
        }
        recipients = [singleUser];
      }

      const notifications = recipients.map((user) => ({
        recipient: user._id,
        title,
        message,
        type: "announcement"
      }));

      await Notification.insertMany(notifications);

      res.json({
        message: `Notification sent to ${recipients.length} users`
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
