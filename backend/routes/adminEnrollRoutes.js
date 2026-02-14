const express = require("express");
const Enrollment = require("../models/enrollment");
const User = require("../models/user");
const Course = require("../models/course");
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * Admin → Assign student to course
 */
router.post(
  "/enroll",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { studentId, courseId } = req.body;
      
      console.log("Enroll request:", { studentId, courseId });

      // Validate student
      const student = await User.findById(studentId);
      console.log("Found student:", student);
      if (!student || student.role !== "student") {
        return res.status(400).json({ message: "Invalid student" });
      }

      // Validate course
      const course = await Course.findById(courseId);
      console.log("Found course:", course);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const enrollment = await Enrollment.create({
        student: studentId,
        course: courseId
      });
      
      console.log("Enrollment created:", enrollment);

      res.json({
        message: "Student enrolled successfully",
        enrollment
      });
    } catch (err) {
      console.error("Enrollment error:", err);
      if (err.code === 11000) {
        return res.status(400).json({ message: "Student already enrolled" });
      }
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * Get all enrollments
 */
router.get(
  "/enrollments",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const enrollments = await Enrollment.find()
        .populate("student", "name email")
        .populate("course", "title code")
        .sort({ createdAt: -1 });

      res.json(enrollments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * Unenroll student from course
 */
router.delete(
  "/enrollments/:id",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
      
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      res.json({ message: "Student unenrolled successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
