const express = require("express");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

const User = require("../../models/adminModels/user");
const Schedule = require("../../models/adminModels/schedule");
const StudentSchedule = require("../../models/adminModels/studentSchedule");
const Notification = require("../../models/adminModels/notification");

const router = express.Router();

/**
 * Admin → Assign schedule to student
 */
router.post(
  "/assign-schedule",
  auth,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const { studentId, scheduleId } = req.body;

      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return res.status(400).json({ message: "Invalid student" });
      }

      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      const assigned = await StudentSchedule.create({
        student: studentId,
        schedule: scheduleId,
      });

      const populatedSchedule = await Schedule.findById(scheduleId).populate(
        "course",
        "title name code"
      );

      const courseTitle =
        populatedSchedule?.course?.title ||
        populatedSchedule?.course?.name ||
        "a course";

      await Notification.create({
        title: "New Schedule Assigned",
        message: `You have been assigned a new schedule for ${courseTitle} on ${populatedSchedule?.day || "a day"} at ${populatedSchedule?.startTime || "scheduled time"}.`,
        recipient: studentId,
        type: "schedule",
      });

      res.json({
        message: "Schedule assigned to student",
        assigned,
      });
    } catch (err) {
      if (err.code === 11000) err.message = "Schedule already assigned";
      next(err);
    }
  }
);

module.exports = router;
