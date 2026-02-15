const express = require("express");
const Schedule = require("../models/schedule");
const enrollment = require("../models/enrollment");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Get student schedule
router.get("/student", auth, async (req, res) => {
  try {
    // 1️⃣ Find courses student is enrolled in
    const enrollments = await enrollment.find({
      student: req.user.id,
    });

    const courseIds = enrollments.map((e) => e.course);

    // 2️⃣ Find schedules for those courses
    const schedules = await Schedule.find({
      course: { $in: courseIds },
    })
      .populate("course", "title code")
      .populate("faculty", "name email");

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;