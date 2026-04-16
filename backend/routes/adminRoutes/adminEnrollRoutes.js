const express = require("express");
const mongoose = require("mongoose");
const Enrollment = require("../../models/adminModels/enrollment");
const User = require("../../models/adminModels/user");
const Course = require("../../models/adminModels/course");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");
const notification = require("../../models/adminModels/notification");

const router = express.Router();

/**
 * Admin → Assign student to course
 */
router.post(
  "/enroll",
  auth,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const { studentId, courseId } = req.body;

      // Validate student
      const student = await User.findById(studentId).lean();
      if (!student || student.role !== "student") {
        return res.status(400).json({ message: "Invalid student" });
      }

      // Validate course
      const course = await Course.findById(courseId).lean();
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const session = await mongoose.startSession();
      let enrollment;
      try {
        await session.withTransaction(async () => {
          [enrollment] = await Enrollment.create(
            [{ student: studentId, course: courseId }],
            { session }
          );
          await notification.create(
            [
              {
                recipient: studentId,
                title: "Course Enrollment",
                message: `You have been enrolled in the course: ${course.title}`,
                type: "enrollment",
              },
            ],
            { session }
          );
        });
      } finally {
        session.endSession();
      }

      res.json({
        message: "Student enrolled successfully",
        enrollment,
      });
    } catch (err) {
      if (err.code === 11000) err.message = "Student already enrolled";
      next(err);
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
  async (req, res, next) => {
    try {
      const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
      if (!hasPagination) {
        const enrollments = await Enrollment.find()
          .populate("student", "name email")
          .populate("course", "title code")
          .sort({ createdAt: -1 })
          .lean();
        return res.json(enrollments);
      }

      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
      const skip = (page - 1) * limit;

      const [enrollments, total] = await Promise.all([
        Enrollment.find()
          .populate("student", "name email")
          .populate("course", "title code")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Enrollment.countDocuments(),
      ]);

      res.json({
        items: enrollments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

const unenrollHandler = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Unenroll student from course
 */
router.delete(
  "/enrollments/:id",
  auth,
  authorizeRoles("admin"),
  unenrollHandler
);

module.exports = router;
