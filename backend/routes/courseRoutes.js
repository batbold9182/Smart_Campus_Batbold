const express = require("express");
const Course = require("../models/adminModels/course");
const User = require("../models/adminModels/user");
const Notification = require("../models/adminModels/notification");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * CREATE COURSE (FACULTY ONLY)
 */
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, code, description, credits, facultyId } = req.body;

    if (!facultyId) {
      return res.status(400).json({ message: "facultyId is required" });
    }

    const facultyUser = await User.findById(facultyId).select("role");
    if (!facultyUser || facultyUser.role !== "faculty") {
      return res.status(400).json({ message: "Invalid facultyId" });
    }

    const course = await Course.create({
      title,
      code,
      description,
      credits,
      faculty: facultyId,
    });
    const populated = await course.populate("faculty", "name email");

    await Notification.create({
      title: "New Course Assignment",
      message: `You have been assigned to ${course.title || "a course"}${course.code ? ` (${course.code})` : ""}.`,
      recipient: facultyId,
      type: "announcement",
    });

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ASSIGN COURSE TO FACULTY (ADMIN ONLY)
 */
router.patch("/:id/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { facultyId } = req.body;
    if (!facultyId) {
      return res.status(400).json({ message: "facultyId is required" });
    }

    const facultyUser = await User.findById(facultyId).select("role");
    if (!facultyUser || facultyUser.role !== "faculty") {
      return res.status(400).json({ message: "Invalid facultyId" });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { faculty: facultyId },
      { new: true }
    ).populate("faculty", "name email");

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
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET ALL COURSES (ADMIN ONLY)
 */
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    if (!hasPagination) {
      const courses = await Course.find().populate("faculty", "name email");
      return res.json(courses);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find().populate("faculty", "name email").skip(skip).limit(limit),
      Course.countDocuments(),
    ]);

    res.json({
      items: courses,
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
});

/**
 * DELETE COURSE (ADMIN ONLY)
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET MY COURSES (FACULTY)
 */
router.get("/my", auth, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ message: "Access denied" });
    }

    const courses = await Course.find({ faculty: req.user.id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
