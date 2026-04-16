const express = require("express");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
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
  [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }).withMessage("Title must be 200 characters or fewer"),
    body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 2000 }).withMessage("Message must be 2000 characters or fewer"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { title, message, recipients, target, userId, type } = req.body;

      let recipientIds = [];

      if (Array.isArray(recipients) && recipients.length > 0) {
        // Validate that all provided IDs are valid ObjectIds and exist in the DB
        const validObjectIds = recipients.filter((id) =>
          mongoose.Types.ObjectId.isValid(id)
        );
        if (validObjectIds.length !== recipients.length) {
          return res.status(400).json({ message: "One or more recipient IDs are invalid" });
        }
        const existingUsers = await User.find({ _id: { $in: validObjectIds } }).select("_id").lean();
        if (existingUsers.length !== validObjectIds.length) {
          return res.status(400).json({ message: "One or more recipients do not exist" });
        }
        recipientIds = validObjectIds;
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
      next(err);
    }
  }
);

module.exports = router;
