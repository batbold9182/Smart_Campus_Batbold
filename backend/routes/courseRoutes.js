const express = require("express");
const Course = require("../models/adminModels/course");
const User = require("../models/adminModels/user");
const Notification = require("../models/adminModels/notification");
const Enrollment = require("../models/adminModels/enrollment");
const Schedule = require("../models/adminModels/schedule");
const StudentSchedule = require("../models/adminModels/studentSchedule");
const Assignment = require("../models/facultyModels/assignment");
const AssignmentSubmission = require("../models/facultyModels/assignmentSubmission");
const Grade = require("../models/facultyModels/grade");
const { cloudinary, hasCloudinaryConfig } = require("../config/cloudinary");
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a course (admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, code, credits, facultyId]
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               code:
 *                 type: string
 *                 maxLength: 20
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               credits:
 *                 type: number
 *               facultyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * CREATE COURSE (FACULTY ONLY)
 */
router.post("/", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const { title, code, description, credits, facultyId } = req.body;

    if (!facultyId) {
      return res.status(400).json({ message: "facultyId is required" });
    }

    const facultyUser = await User.findById(facultyId).select("role").lean();
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
    next(err);
  }
});

/**
 * ASSIGN COURSE TO FACULTY (ADMIN ONLY)
 */
router.patch("/:id/assign", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const { facultyId } = req.body;
    if (!facultyId) {
      return res.status(400).json({ message: "facultyId is required" });
    }

    const facultyUser = await User.findById(facultyId).select("role").lean();
    if (!facultyUser || facultyUser.role !== "faculty") {
      return res.status(400).json({ message: "Invalid facultyId" });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
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

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: List all courses (admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (omit for all courses)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (max 100)
 *     responses:
 *       200:
 *         description: Array of courses (or paginated object when page/limit supplied)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
/**
 * GET ALL COURSES (ADMIN ONLY)
 */
router.get("/", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    if (!hasPagination) {
      const courses = await Course.find().populate("faculty", "name email").lean();
      return res.json(courses);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find().populate("faculty", "name email").skip(skip).limit(limit).lean(),
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
    next(err);
  }
});

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course (admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * DELETE COURSE (ADMIN ONLY)
 * Cascade-deletes all related documents and Cloudinary submission files.
 */
router.delete("/:id", auth, authorizeRoles("admin"), async (req, res, next) => {
  const courseId = req.params.id;
  try {
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Collect schedule IDs so StudentSchedule rows can be removed
    const schedules = await Schedule.find({ course: courseId }).select("_id").lean();
    const scheduleIds = schedules.map((s) => s._id);

    // Collect Cloudinary public IDs from all submissions for this course
    const submissions = await AssignmentSubmission.find({ course: courseId })
      .select("cloudinaryPublicId")
      .lean();
    const cloudinaryIds = submissions
      .filter((s) => s.cloudinaryPublicId)
      .map((s) => s.cloudinaryPublicId);

    // Delete Cloudinary files first (failures are non-fatal)
    if (cloudinaryIds.length > 0 && hasCloudinaryConfig()) {
      await Promise.allSettled(
        cloudinaryIds.map((id) =>
          cloudinary.uploader.destroy(id, { resource_type: "raw" })
        )
      );
    }

    // Delete all related documents and the course itself in parallel
    await Promise.all([
      Enrollment.deleteMany({ course: courseId }),
      Assignment.deleteMany({ course: courseId }),
      AssignmentSubmission.deleteMany({ course: courseId }),
      Grade.deleteMany({ course: courseId }),
      Schedule.deleteMany({ course: courseId }),
      scheduleIds.length > 0
        ? StudentSchedule.deleteMany({ schedule: { $in: scheduleIds } })
        : Promise.resolve(),
      Course.findByIdAndDelete(courseId),
    ]);

    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /courses/my:
 *   get:
 *     summary: Get courses assigned to the authenticated faculty
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of courses for the faculty
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
/**
 * GET MY COURSES (FACULTY)
 */
router.get("/my", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const courses = await Course.find({ faculty: req.user.id }).lean();
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
