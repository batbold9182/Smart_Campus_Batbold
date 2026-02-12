const express = require("express");
const Course = require("../models/course");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * ASSIGN COURSE TO FACULTY (ADMIN ONLY)
 */
router.put("/courses/:courseId/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { facultyId } = req.body;

    const faculty = await User.findById(facultyId).select("role");
    if (!faculty || faculty.role !== "faculty") {
      return res.status(400).json({ message: "Invalid faculty" });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { faculty: facultyId },
      { new: true }
    ).populate("faculty", "name email");

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
