const express = require("express");
const Notification = require("../../models/adminModels/notification.js");
const auth = require("../../middleware/authMiddleware.js");
const authorizeRoles = require("../../middleware/roleMiddleware");
const User = require("../../models/adminModels/user.js");

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
      const { title, message, recipients, target, userId, type } = req.body;

      let recipientIds = [];

      if (Array.isArray(recipients) && recipients.length > 0) {
        recipientIds = recipients;
      } else {
        let users = [];

        if (target === "all") {
          users = await User.find().select("_id").lean();
        }

        if (target === "students") {
          users = await User.find({ role: "student" }).select("_id").lean();
        }

        if (target === "faculty") {
          users = await User.find({ role: "faculty" }).select("_id").lean();
        }

        if (target === "single" && userId) {
          const singleUser = await User.findById(userId).select("_id").lean();
          if (!singleUser) {
            return res.status(404).json({ message: "User not found" });
          }
          users = [singleUser];
        }

        recipientIds = users.map((u) => u._id);
      }

      if (recipientIds.length === 0) {
        return res.status(400).json({ message: "Recipients required" });
      }

      const notifications = await Notification.insertMany(
        recipientIds.map((recipientId) => ({
          recipient: recipientId,
          title,
          message,
          type: type || "announcement"
        }))
      );

      res.json({
        message: `Notification sent to ${notifications.length} users`,
        count: notifications.length
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
