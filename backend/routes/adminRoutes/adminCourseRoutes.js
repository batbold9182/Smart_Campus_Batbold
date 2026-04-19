const express = require("express");
const Course = require("../../models/adminModels/course");
const User = require("../../models/adminModels/user");
const Notification = require("../../models/adminModels/notification");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

const router = express.Router();

/**
 * ASSIGN COURSE TO FACULTY (ADMIN ONLY)
 */
router.put("/courses/:courseId/assign", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const { facultyId } = req.body;

    const faculty = await User.findById(facultyId).select("role").lean();
    if (!faculty || faculty.role !== "faculty") {
      return res.status(400).json({ message: "Invalid faculty" });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { faculty: facultyId },
      { new: true }
    ).populate("faculty", "name email").lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await Notification.create({
      title: "New Course Assignment",
      message: `You have been assigned to ${course.title || "a course"}${course.code ? ` (${course.code})` : ""}.`,
      recipient: facultyId,
      type: "announcement",
    });

    res.json(course);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
