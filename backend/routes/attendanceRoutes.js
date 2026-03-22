const express = require("express");
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Attendance = require("../models/attendance");

const router = express.Router();

const ALLOWED_STATUSES = ["present", "absent", "late", "excused"];

const toStartOfDay = (dateValue) => {
  const parsed = dateValue ? new Date(dateValue) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
};

const formatDateKey = (dateValue) => {
  const year = dateValue.getUTCFullYear();
  const month = String(dateValue.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatAttendance = (record) => ({
  id: String(record._id),
  status: record.status,
  remarks: record.remarks || "",
  date: formatDateKey(record.date),
  markedAt: record.markedAt,
  updatedAt: record.updatedAt,
});

router.get("/faculty/courses", auth, authorizeRoles("faculty"), async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.user.id })
      .select("title code credits")
      .sort({ title: 1 })
      .lean();

    const courseIds = courses.map((course) => course._id);
    const today = toStartOfDay(new Date());

    const [enrollmentCounts, markedTodayCounts] = await Promise.all([
      Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
      ]),
      Attendance.aggregate([
        { $match: { course: { $in: courseIds }, date: today } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
      ]),
    ]);

    const enrolledMap = new Map(enrollmentCounts.map((item) => [String(item._id), item.count]));
    const markedMap = new Map(markedTodayCounts.map((item) => [String(item._id), item.count]));

    res.json({
      courses: courses.map((course) => ({
        id: String(course._id),
        title: course.title,
        code: course.code,
        credits: course.credits,
        enrolledCount: enrolledMap.get(String(course._id)) || 0,
        markedTodayCount: markedMap.get(String(course._id)) || 0,
      })),
    });
  } catch (err) {
    console.error("FACULTY_ATTENDANCE_COURSES_ERROR:", err);
    res.status(500).json({ message: "Failed to load faculty attendance courses" });
  }
});

router.get("/faculty/courses/:courseId/students", auth, authorizeRoles("faculty"), async (req, res) => {
  try {
    const attendanceDate = toStartOfDay(req.query.date);
    if (!attendanceDate) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const course = await Course.findOne({ _id: req.params.courseId, faculty: req.user.id })
      .select("title code credits")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const [enrollments, attendanceRecords] = await Promise.all([
      Enrollment.find({ course: course._id })
        .populate("student", "name email program yearLevel studentId")
        .lean(),
      Attendance.find({ course: course._id, date: attendanceDate }).lean(),
    ]);

    const attendanceMap = new Map(attendanceRecords.map((record) => [String(record.student), record]));

    const students = enrollments
      .filter((enrollment) => enrollment.student)
      .map((enrollment) => {
        const currentAttendance = attendanceMap.get(String(enrollment.student._id));
        return {
          student: {
            id: String(enrollment.student._id),
            name: enrollment.student.name,
            email: enrollment.student.email,
            program: enrollment.student.program || null,
            yearLevel: enrollment.student.yearLevel ?? null,
            studentId: enrollment.student.studentId || null,
          },
          attendance: currentAttendance ? formatAttendance(currentAttendance) : null,
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
      date: formatDateKey(attendanceDate),
      students,
    });
  } catch (err) {
    console.error("FACULTY_ATTENDANCE_STUDENTS_ERROR:", err);
    res.status(500).json({ message: "Failed to load attendance list" });
  }
});

router.put(
  "/faculty/courses/:courseId/students/:studentId",
  auth,
  authorizeRoles("faculty"),
  async (req, res) => {
    try {
      const attendanceDate = toStartOfDay(req.body?.date);
      if (!attendanceDate) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }

      const status = typeof req.body?.status === "string" ? req.body.status.trim().toLowerCase() : "";
      const remarks = typeof req.body?.remarks === "string" ? req.body.remarks.trim() : "";

      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid attendance status" });
      }

      const course = await Course.findOne({ _id: req.params.courseId, faculty: req.user.id })
        .select("title")
        .lean();

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const enrollment = await Enrollment.findOne({
        course: req.params.courseId,
        student: req.params.studentId,
      }).populate("student", "name");

      if (!enrollment) {
        return res.status(404).json({ message: "Student is not enrolled in this course" });
      }

      const attendance = await Attendance.findOneAndUpdate(
        {
          course: req.params.courseId,
          student: req.params.studentId,
          date: attendanceDate,
        },
        {
          faculty: req.user.id,
          status,
          remarks,
          markedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      res.json({
        message: `Attendance saved for ${enrollment.student?.name || "student"}`,
        attendance: formatAttendance(attendance),
      });
    } catch (err) {
      console.error("FACULTY_ATTENDANCE_SAVE_ERROR:", err);
      res.status(500).json({ message: "Failed to save attendance" });
    }
  }
);

module.exports = router;