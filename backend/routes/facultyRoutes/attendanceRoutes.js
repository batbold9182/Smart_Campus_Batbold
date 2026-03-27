const express = require("express");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");
const Course = require("../../models/course");
const Enrollment = require("../../models/enrollment");
const Attendance = require("../../models/attendance");
const Schedule = require("../../models/schedule");
const StudentSchedule = require("../../models/studentSchedule");

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

const formatAttendance = (record) => {
  if (!record) {
    return null;
  }

  return {
    id: String(record._id),
    scheduleId: record.schedule ? String(record.schedule) : null,
    status: record.status,
    remarks: record.remarks || "",
    date: formatDateKey(record.date),
    markedAt: record.markedAt,
    updatedAt: record.updatedAt,
  };
};

const getDayNameFromDate = (dateValue) =>
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dateValue.getUTCDay()];

const loadStudentSchedulesForDay = async (studentId, dayName) => {
  const assignedRows = await StudentSchedule.find({ student: studentId }).populate({
    path: "schedule",
    match: { day: dayName },
    populate: [
      { path: "course", select: "title code credits name" },
      { path: "faculty", select: "name email" },
    ],
  });

  const assignedSchedules = assignedRows.map((row) => row.schedule).filter(Boolean);
  if (assignedSchedules.length > 0) {
    return assignedSchedules;
  }

  const enrollments = await Enrollment.find({ student: studentId }).select("course").lean();
  const courseIds = enrollments.map((item) => item.course);

  if (courseIds.length === 0) {
    return [];
  }

  return Schedule.find({
    course: { $in: courseIds },
    day: dayName,
  })
    .populate("course", "title code credits name")
    .populate("faculty", "name email")
    .sort({ startTime: 1 })
    .lean();
};

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
    const scheduleId = typeof req.query.scheduleId === "string" ? req.query.scheduleId.trim() : "";
    if (!attendanceDate) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const course = await Course.findOne({ _id: req.params.courseId, faculty: req.user.id })
      .select("title code credits")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (scheduleId) {
      const schedule = await Schedule.findOne({
        _id: scheduleId,
        course: course._id,
        faculty: req.user.id,
      })
        .select("_id")
        .lean();

      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
    }

    const attendanceMatch = {
      course: course._id,
      date: attendanceDate,
      schedule: scheduleId || null,
    };

    const [enrollments, attendanceRecords] = await Promise.all([
      Enrollment.find({ course: course._id })
        .populate("student", "name email program yearLevel studentId")
        .lean(),
      Attendance.find(attendanceMatch).lean(),
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
      scheduleId: scheduleId || null,
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
      const scheduleId = typeof req.body?.scheduleId === "string" ? req.body.scheduleId.trim() : "";
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

      if (scheduleId) {
        const schedule = await Schedule.findOne({
          _id: scheduleId,
          course: req.params.courseId,
          faculty: req.user.id,
        })
          .select("_id")
          .lean();

        if (!schedule) {
          return res.status(404).json({ message: "Schedule not found" });
        }
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
          schedule: scheduleId || null,
        },
        {
          faculty: req.user.id,
          schedule: scheduleId || null,
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

router.get("/student/summary", auth, authorizeRoles("student"), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: "course",
        select: "title code credits faculty",
        populate: { path: "faculty", select: "name" },
      })
      .lean();

    const attendanceRecords = await Attendance.find({ student: req.user.id })
      .sort({ date: -1, updatedAt: -1 })
      .lean();

    const totals = {
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
    };

    const groupedAttendance = new Map();

    attendanceRecords.forEach((record) => {
      if (record.status === "present") totals.presentCount += 1;
      if (record.status === "absent") totals.absentCount += 1;
      if (record.status === "late") totals.lateCount += 1;
      if (record.status === "excused") totals.excusedCount += 1;

      const courseKey = String(record.course);
      const current = groupedAttendance.get(courseKey) || {
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        totalMarked: 0,
        latestAttendance: null,
      };

      current.totalMarked += 1;
      current.latestAttendance = current.latestAttendance || record;

      if (record.status === "present") current.presentCount += 1;
      if (record.status === "absent") current.absentCount += 1;
      if (record.status === "late") current.lateCount += 1;
      if (record.status === "excused") current.excusedCount += 1;

      groupedAttendance.set(courseKey, current);
    });

    const items = enrollments
      .filter((enrollment) => enrollment.course)
      .map((enrollment) => {
        const course = enrollment.course;
        const stats = groupedAttendance.get(String(course._id)) || {
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          excusedCount: 0,
          totalMarked: 0,
          latestAttendance: null,
        };

        return {
          course: {
            id: String(course._id),
            title: course.title,
            code: course.code,
            credits: course.credits,
            facultyName: course.faculty?.name || "Unassigned",
          },
          summary: {
            presentCount: stats.presentCount,
            absentCount: stats.absentCount,
            lateCount: stats.lateCount,
            excusedCount: stats.excusedCount,
            totalMarked: stats.totalMarked,
          },
          latestAttendance: stats.latestAttendance ? formatAttendance(stats.latestAttendance) : null,
        };
      })
      .sort((left, right) => left.course.title.localeCompare(right.course.title));

    res.json({
      items,
      summary: {
        courseCount: items.length,
        totalMarked: attendanceRecords.length,
        presentCount: totals.presentCount,
        absentCount: totals.absentCount,
        lateCount: totals.lateCount,
        excusedCount: totals.excusedCount,
      },
    });
  } catch (err) {
    console.error("STUDENT_ATTENDANCE_SUMMARY_ERROR:", err);
    res.status(500).json({ message: "Failed to load attendance summary" });
  }
});

router.get("/student/schedule", auth, authorizeRoles("student"), async (req, res) => {
  try {
    const attendanceDate = toStartOfDay(req.query.date);
    if (!attendanceDate) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const dayName = getDayNameFromDate(attendanceDate);
    const schedules = await loadStudentSchedulesForDay(req.user.id, dayName);
    const courseIds = schedules.map((item) => item.course?._id).filter(Boolean);
    const scheduleIds = schedules.map((item) => item._id).filter(Boolean);

    const attendanceRecords = courseIds.length && scheduleIds.length
      ? await Attendance.find({
          student: req.user.id,
          date: attendanceDate,
          course: { $in: courseIds },
          $or: [{ schedule: { $in: scheduleIds } }, { schedule: null }],
        }).lean()
      : [];

    const attendanceBySchedule = new Map(
      attendanceRecords
        .filter((record) => record.schedule)
        .map((record) => [String(record.schedule), record])
    );

    const attendanceByCourseFallback = new Map(
      attendanceRecords
        .filter((record) => !record.schedule)
        .map((record) => [String(record.course), record])
    );

    const items = schedules.map((schedule) => ({
      schedule: {
        id: String(schedule._id),
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room,
      },
      course: schedule.course
        ? {
            id: String(schedule.course._id),
            title: schedule.course.title || schedule.course.name || "Untitled Course",
            code: schedule.course.code || "",
            credits: schedule.course.credits ?? null,
          }
        : null,
      facultyName: schedule.faculty?.name || "Unassigned",
      attendance: schedule.course
        ? formatAttendance(
            attendanceBySchedule.get(String(schedule._id)) ||
              attendanceByCourseFallback.get(String(schedule.course._id))
          )
        : null,
    }));

    res.json({
      date: formatDateKey(attendanceDate),
      day: dayName,
      items,
    });
  } catch (err) {
    console.error("STUDENT_ATTENDANCE_SCHEDULE_ERROR:", err);
    res.status(500).json({ message: "Failed to load schedule attendance" });
  }
});

module.exports = router;