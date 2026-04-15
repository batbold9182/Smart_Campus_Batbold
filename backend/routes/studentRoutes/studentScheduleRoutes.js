const express = require("express");
const Schedule = require("../../models/adminModels/schedule");
const enrollment = require("../../models/adminModels/enrollment");
const StudentSchedule = require("../../models/adminModels/studentSchedule");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");
const router = express.Router();

// Get student schedule
router.get("/student", auth, async (req, res, next) => {
  try {
    const assignedRows = await StudentSchedule.find({
      student: req.user.id,
    }).populate({
      path: "schedule",
      populate: [
        { path: "course", select: "title code name" },
        { path: "faculty", select: "name email" },
      ],
    }).lean();

    const assignedSchedules = assignedRows
      .map((row) => row.schedule)
      .filter(Boolean);

    if (assignedSchedules.length > 0) {
      return res.json(assignedSchedules);
    }

    const enrollments = await enrollment.find({
      student: req.user.id,
    }).lean();

    const courseIds = enrollments.map((e) => e.course);

    const schedules = await Schedule.find({
      course: { $in: courseIds },
    })
      .populate("course", "title code name")
      .populate("faculty", "name email")
      .lean();

    res.json(schedules);
  } catch (err) {
    next(err);
  }
});

// Get faculty schedule
router.get("/faculty", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const schedules = await Schedule.find({ faculty: req.user.id })
      .populate("course", "title code name")
      .sort({ day: 1, startTime: 1 })
      .lean();

    res.json(schedules);
  } catch (err) {
    next(err);
  }
});

module.exports = router;