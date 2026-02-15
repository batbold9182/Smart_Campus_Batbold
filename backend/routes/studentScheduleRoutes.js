const express = require("express");
const Schedule = require("../models/schedule");
const enrollment = require("../models/enrollment");
const StudentSchedule = require("../models/studentSchedule");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Get student schedule
router.get("/student", auth, async (req, res) => {
  try {
    const assignedRows = await StudentSchedule.find({
      student: req.user.id,
    }).populate({
      path: "schedule",
      populate: [
        { path: "course", select: "title code name" },
        { path: "faculty", select: "name email" },
      ],
    });

    const assignedSchedules = assignedRows
      .map((row) => row.schedule)
      .filter(Boolean);

    if (assignedSchedules.length > 0) {
      return res.json(assignedSchedules);
    }

    const enrollments = await enrollment.find({
      student: req.user.id,
    });

    const courseIds = enrollments.map((e) => e.course);

    const schedules = await Schedule.find({
      course: { $in: courseIds },
    })
      .populate("course", "title code name")
      .populate("faculty", "name email");

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;