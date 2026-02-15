const express = require("express");
const Schedule = require("../models/schedule");
const Course = require("../models/course");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

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

module.exports = router;
