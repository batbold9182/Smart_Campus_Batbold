const express = require("express");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");
const Course = require("../../models/adminModels/course");
const Enrollment = require("../../models/adminModels/enrollment");
const Grade = require("../../models/facultyModels/grade");
const Notification = require("../../models/adminModels/notification");

const router = express.Router();

const formatGrade = (grade) => ({
  id: String(grade._id),
  value: grade.value,
  remarks: grade.remarks || "",
  gradedAt: grade.gradedAt,
  updatedAt: grade.updatedAt,
});

router.get("/faculty/courses", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const courses = await Course.find({ faculty: req.user.id })
      .select("title code credits")
      .sort({ title: 1 })
      .lean();

    const courseIds = courses.map((course) => course._id);

    const [enrollmentCounts, gradedCounts] = await Promise.all([
      Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
      ]),
      Grade.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
      ]),
    ]);

    const enrollmentMap = new Map(enrollmentCounts.map((item) => [String(item._id), item.count]));
    const gradedMap = new Map(gradedCounts.map((item) => [String(item._id), item.count]));

    res.json({
      courses: courses.map((course) => ({
        id: String(course._id),
        title: course.title,
        code: course.code,
        credits: course.credits,
        enrolledCount: enrollmentMap.get(String(course._id)) || 0,
        gradedCount: gradedMap.get(String(course._id)) || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/faculty/courses/:courseId/students", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, faculty: req.user.id })
      .select("title code credits")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const [enrollments, grades] = await Promise.all([
      Enrollment.find({ course: course._id })
        .populate("student", "name email program yearLevel studentId")
        .lean(),
      Grade.find({ course: course._id }).lean(),
    ]);

    const gradeMap = new Map(grades.map((grade) => [String(grade.student), grade]));

    const students = enrollments
      .filter((enrollment) => enrollment.student)
      .map((enrollment) => {
        const currentGrade = gradeMap.get(String(enrollment.student._id));
        return {
          student: {
            id: String(enrollment.student._id),
            name: enrollment.student.name,
            email: enrollment.student.email,
            program: enrollment.student.program || null,
            yearLevel: enrollment.student.yearLevel ?? null,
            studentId: enrollment.student.studentId || null,
          },
          grade: currentGrade ? formatGrade(currentGrade) : null,
        };
      })
      .sort((left, right) => left.student.name.localeCompare(right.student.name));

    res.json({
      course: {
        id: String(course._id),
        title: course.title,
        code: course.code,
        credits: course.credits,
      },
      students,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/faculty/courses/:courseId/students/:studentId", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const numericValue = Number(req.body?.value);
    const remarks = typeof req.body?.remarks === "string" ? req.body.remarks.trim() : "";

    if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 6) {
      return res.status(400).json({ message: "Grade value must be a number between 0 and 6" });
    }

    const course = await Course.findOne({ _id: req.params.courseId, faculty: req.user.id })
      .select("title code")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      course: req.params.courseId,
      student: req.params.studentId,
    }).populate("student", "name").lean();

    if (!enrollment) {
      return res.status(404).json({ message: "Student is not enrolled in this course" });
    }

    const grade = await Grade.findOneAndUpdate(
      {
        course: req.params.courseId,
        student: req.params.studentId,
      },
      {
        faculty: req.user.id,
        value: numericValue,
        remarks,
        gradedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    await Notification.create({
      recipient: req.params.studentId,
      title: "Grade Updated",
      message: `A grade has been published for ${course.title}${course.code ? ` (${course.code})` : ""}.`,
      type: "announcement",
    });

    res.json({
      message: `Grade saved for ${enrollment.student?.name || "student"}`,
      grade: formatGrade(grade),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/student", auth, authorizeRoles("student"), async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const [enrollments, grades, totalEnrollments] = await Promise.all([
      Enrollment.find({ student: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "course", select: "title code credits faculty", populate: { path: "faculty", select: "name" } })
        .lean(),
      Grade.find({ student: req.user.id }).lean(),
      Enrollment.countDocuments({ student: req.user.id }),
    ]);

    const gradeMap = new Map(grades.map((grade) => [String(grade.course), grade]));
    const gradedValues = grades.map((grade) => grade.value);
    const averageGrade = gradedValues.length
      ? Number((gradedValues.reduce((sum, value) => sum + value, 0) / gradedValues.length).toFixed(1))
      : null;

    const items = enrollments
      .filter((enrollment) => enrollment.course)
      .map((enrollment) => {
        const course = enrollment.course;
        const grade = gradeMap.get(String(course._id));

        return {
          course: {
            id: String(course._id),
            title: course.title,
            code: course.code,
            credits: course.credits,
            facultyName: course.faculty?.name || "Unassigned",
          },
          grade: grade ? formatGrade(grade) : null,
        };
      })
      .sort((left, right) => left.course.title.localeCompare(right.course.title));

    res.json({
      items,
      pagination: {
        page,
        limit,
        total: totalEnrollments,
        totalPages: Math.ceil(totalEnrollments / limit),
      },
      summary: {
        courseCount: totalEnrollments,
        gradedCount: grades.length,
        averageGrade,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;