const express = require("express");
const Schedule = require("../../models/adminModels/schedule");
const Course = require("../../models/adminModels/course");
const User = require("../../models/adminModels/user");
const StudentSchedule = require("../../models/adminModels/studentSchedule");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

const router = express.Router();
/**
 * Admin → Unassign student from schedule
 */
router.delete(
  "/schedule/unassign",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { studentId, scheduleId } = req.body;

      const deleted = await StudentSchedule.findOneAndDelete({
        student: studentId,
        schedule: scheduleId,
      });

      if (!deleted) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      res.json({
        message: "Student unassigned from schedule successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * Admin → Get all schedules
 */
router.get(
  "/schedules",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
      if (!hasPagination) {
        const schedules = await Schedule.find()
          .populate("course", "name code title")
          .populate("faculty", "name email")
          .sort({ day: 1, startTime: 1 });
        return res.json(schedules);
      }

      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
      const skip = (page - 1) * limit;

      const [schedules, total] = await Promise.all([
        Schedule.find()
          .populate("course", "name code title")
          .populate("faculty", "name email")
          .sort({ day: 1, startTime: 1 })
          .skip(skip)
          .limit(limit),
        Schedule.countDocuments(),
      ]);

      res.json({
        items: schedules,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * Admin → Create schedule
 */
router.post(
  "/schedule",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { courseId, facultyId, day, startTime, endTime, room } = req.body;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      const faculty = await User.findById(facultyId);
      if (!faculty || faculty.role !== "faculty") {
        return res.status(400).json({ message: "Invalid faculty" });
      }

      const schedule = await Schedule.create({
        course: courseId,
        faculty: facultyId,
        day,
        startTime,
        endTime,
        room,
      });

      res.json({
        message: "Schedule created successfully",
        schedule,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * Admin → Delete schedule
 */
router.delete(
  "/schedule/:id",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const scheduleId = req.params.id;

      const deleted = await Schedule.findByIdAndDelete(scheduleId);

      if (!deleted) {
        return res.status(404).json({ message: "Schedule not found" });
      }

      await StudentSchedule.deleteMany({ schedule: scheduleId });

      res.json({ message: "Schedule deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
