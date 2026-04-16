const express = require("express");
const mongoose = require("mongoose");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");
const multer = require("multer");
const Assignment = require("../../models/facultyModels/assignment");
const AssignmentSubmission = require("../../models/facultyModels/assignmentSubmission");
const Course = require("../../models/adminModels/course");
const Enrollment = require("../../models/adminModels/enrollment");
const Notification = require("../../models/adminModels/notification");
const { cloudinary, hasCloudinaryConfig } = require("../../config/cloudinary");

const router = express.Router();
const MAX_SUBMISSION_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_SUBMISSION_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/plain",
]);
const ALLOWED_SUBMISSION_EXTENSIONS = /\.(pdf|doc|docx|txt|jpg|jpeg|png|webp|gif)$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_SUBMISSION_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const hasAllowedMime = ALLOWED_SUBMISSION_MIME_TYPES.has((file.mimetype || "").toLowerCase());
    const hasAllowedExtension = ALLOWED_SUBMISSION_EXTENSIONS.test(file.originalname || "");

    if (hasAllowedMime || hasAllowedExtension) {
      cb(null, true);
      return;
    }

    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "submissionFile"));
  },
});

const handleSubmissionUpload = (req, res, next) => {
  upload.single("submissionFile")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "Submission file must be 10 MB or smaller" });
        return;
      }

      res.status(400).json({
        message: "Unsupported file type. Use PDF, DOC, DOCX, TXT, JPG, PNG, WEBP, or GIF.",
      });
      return;
    }

    next(error);
  });
};

const formatAssignment = (assignment) => ({
  id: String(assignment._id),
  title: assignment.title,
  description: assignment.description || "",
  dueDate: assignment.dueDate,
  maxPoints: assignment.maxPoints,
  createdAt: assignment.createdAt,
  updatedAt: assignment.updatedAt,
});

const formatSubmission = (submission) => {
  if (!submission) {
    return null;
  }

  return {
    id: String(submission._id),
    notes: submission.notes || "",
    fileUrl: submission.fileUrl || null,
    fileName: submission.fileName || null,
    fileType: submission.fileType || null,
    fileSize: submission.fileSize ?? null,
    submittedAt: submission.submittedAt,
    score: typeof submission.score === "number" ? submission.score : null,
    feedback: submission.feedback || "",
    reviewedAt: submission.reviewedAt || null,
    updatedAt: submission.updatedAt,
  };
};

const formatFacultySubmission = (submission) => ({
  ...formatSubmission(submission),
  student: {
    id: String(submission.student._id),
    name: submission.student.name,
    email: submission.student.email,
    program: submission.student.program || null,
    yearLevel: submission.student.yearLevel ?? null,
    studentId: submission.student.studentId || null,
  },
});

const formatDateKey = (dateValue) => {
  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toSafeFileName = (value) => {
  const raw = typeof value === "string" && value.trim() ? value.trim() : "assignment-submission";
  return raw.replace(/[\\/:*?"<>|]/g, "_");
};

const getFileExtension = (value) => {
  const match = typeof value === "string" ? value.trim().match(/\.([a-zA-Z0-9]+)$/) : null;
  return match ? match[1].toLowerCase() : "";
};

const uploadSubmissionFile = (fileBuffer, fileName, mimeType) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "smart-campus/assignment-submissions",
        resource_type: "raw",
        public_id: `${Date.now()}-${(fileName || "submission").replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        use_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });

router.get("/faculty/courses", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const courses = await Course.find({ faculty: req.user.id })
      .select("title code credits")
      .sort({ title: 1 })
      .lean();

    const courseIds = courses.map((course) => course._id);

    const [enrollmentCounts, assignmentCounts] = await Promise.all([
      Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
      ]),
      Assignment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: "$course", count: { $sum: 1 } } },
      ]),
    ]);

    const enrollmentMap = new Map(enrollmentCounts.map((item) => [String(item._id), item.count]));
    const assignmentMap = new Map(assignmentCounts.map((item) => [String(item._id), item.count]));

    res.json({
      courses: courses.map((course) => ({
        id: String(course._id),
        title: course.title,
        code: course.code,
        credits: course.credits,
        enrolledCount: enrollmentMap.get(String(course._id)) || 0,
        assignmentCount: assignmentMap.get(String(course._id)) || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/faculty/courses/:courseId/assignments", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, faculty: req.user.id })
      .select("title code credits")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const assignments = await Assignment.find({ course: course._id, faculty: req.user.id })
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    const assignmentIds = assignments.map((assignment) => assignment._id);
    const [submissionCounts, reviewedCounts] = await Promise.all([
      AssignmentSubmission.aggregate([
        { $match: { assignment: { $in: assignmentIds } } },
        { $group: { _id: "$assignment", count: { $sum: 1 } } },
      ]),
      AssignmentSubmission.aggregate([
        { $match: { assignment: { $in: assignmentIds }, reviewedAt: { $ne: null } } },
        { $group: { _id: "$assignment", count: { $sum: 1 } } },
      ]),
    ]);

    const submissionMap = new Map(submissionCounts.map((item) => [String(item._id), item.count]));
    const reviewedMap = new Map(reviewedCounts.map((item) => [String(item._id), item.count]));

    res.json({
      course: {
        id: String(course._id),
        title: course.title,
        code: course.code,
        credits: course.credits,
      },
      assignments: assignments.map((assignment) => ({
        ...formatAssignment(assignment),
        submissionCount: submissionMap.get(String(assignment._id)) || 0,
        reviewedCount: reviewedMap.get(String(assignment._id)) || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/faculty/courses/:courseId/assignments/:assignmentId/submissions",
  auth,
  authorizeRoles("faculty"),
  async (req, res, next) => {
    try {
      const assignment = await Assignment.findOne({
        _id: req.params.assignmentId,
        course: req.params.courseId,
        faculty: req.user.id,
      })
        .select("title description dueDate maxPoints course")
        .lean();

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      const submissions = await AssignmentSubmission.find({ assignment: assignment._id })
        .populate("student", "name email program yearLevel studentId")
        .sort({ submittedAt: -1, updatedAt: -1 })
        .lean();

      res.json({
        assignment: {
          ...formatAssignment(assignment),
          submissionCount: submissions.length,
          reviewedCount: submissions.filter((submission) => submission.reviewedAt).length,
        },
        submissions: submissions
          .filter((submission) => submission.student)
          .map((submission) => formatFacultySubmission(submission)),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/faculty/assignments/:assignmentId/submissions/:submissionId/review",
  auth,
  authorizeRoles("faculty"),
  async (req, res, next) => {
    try {
      const feedback = typeof req.body?.feedback === "string" ? req.body.feedback.trim() : "";
      const rawScore = req.body?.score;
      const hasScore = rawScore !== undefined && rawScore !== null && String(rawScore).trim() !== "";
      const score = hasScore ? Number(rawScore) : null;

      const assignment = await Assignment.findOne({
        _id: req.params.assignmentId,
        faculty: req.user.id,
      })
        .select("maxPoints title course")
        .lean();

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      if (hasScore && (!Number.isFinite(score) || score < 0 || score > assignment.maxPoints)) {
        return res.status(400).json({ message: `Score must be between 0 and ${assignment.maxPoints}` });
      }

      const submission = await AssignmentSubmission.findOne({
        _id: req.params.submissionId,
        assignment: assignment._id,
        faculty: req.user.id,
      }).populate("student", "name");

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      submission.score = score;
      submission.feedback = feedback;
      submission.reviewedAt = new Date();
      await submission.save();

      await Notification.create({
        recipient: submission.student._id,
        title: "Assignment Feedback Published",
        message: `Feedback is available for ${assignment.title}.`,
        type: "announcement",
      });

      res.json({
        message: `Review saved for ${submission.student?.name || "student"}`,
        submission: formatSubmission(submission),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/submissions/:submissionId/download", auth, async (req, res, next) => {
  try {
    const submission = await AssignmentSubmission.findById(req.params.submissionId)
      .select("student faculty fileUrl fileName fileType cloudinaryPublicId")
      .lean();

    if (!submission || !submission.fileUrl) {
      return res.status(404).json({ message: "Submission file not found" });
    }

    const mongoose = require("mongoose");
    const reqUserId = new mongoose.Types.ObjectId(req.user.id);
    const isStudentOwner = req.user.role === "student" && submission.student && new mongoose.Types.ObjectId(submission.student).equals(reqUserId);
    const isFacultyOwner = req.user.role === "faculty" && submission.faculty && new mongoose.Types.ObjectId(submission.faculty).equals(reqUserId);

    if (!isStudentOwner && !isFacultyOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    const fileName = toSafeFileName(submission.fileName);
    const fileFormat = getFileExtension(fileName);

    if (submission.cloudinaryPublicId && fileFormat) {
      const signedDownloadUrl = cloudinary.utils.private_download_url(
        submission.cloudinaryPublicId,
        fileFormat,
        {
          resource_type: "raw",
          type: "upload",
          attachment: true,
        }
      );

      return res.redirect(signedDownloadUrl);
    }

    const response = await fetch(submission.fileUrl);

    if (!response.ok) {
      return res.status(502).json({ message: "Failed to download submission file" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = submission.fileType || response.headers.get("content-type") || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

router.post("/faculty/courses/:courseId/assignments", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const description = typeof req.body?.description === "string" ? req.body.description.trim() : "";
    const maxPoints = Number(req.body?.maxPoints);
    const dueDate = typeof req.body?.dueDate === "string" ? new Date(req.body.dueDate) : new Date(req.body?.dueDate);

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!Number.isFinite(maxPoints) || maxPoints < 0) {
      return res.status(400).json({ message: "Max points must be a valid number greater than or equal to 0" });
    }

    if (Number.isNaN(dueDate.getTime())) {
      return res.status(400).json({ message: "A valid due date is required" });
    }

    const course = await Course.findOne({ _id: req.params.courseId, faculty: req.user.id })
      .select("title code")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId }).select("student").lean();
    const notificationDocs = enrollments
      .filter((enrollment) => enrollment.student)
      .map((enrollment) => ({
        recipient: enrollment.student,
        title: "New Assignment",
        message: `${title} has been posted for ${course.title}${course.code ? ` (${course.code})` : ""}.`,
        type: "announcement",
      }));

    const session = await mongoose.startSession();
    let assignment;
    try {
      await session.withTransaction(async () => {
        [assignment] = await Assignment.create(
          [{ title, description, dueDate, maxPoints, course: req.params.courseId, faculty: req.user.id }],
          { session }
        );
        if (notificationDocs.length > 0) {
          await Notification.insertMany(notificationDocs, { session });
        }
      });
    } finally {
      session.endSession();
    }

    res.status(201).json({
      message: "Assignment created successfully",
      assignment: formatAssignment(assignment),
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:assignmentId", auth, authorizeRoles("faculty"), async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.assignmentId,
      faculty: req.user.id,
    }).lean();

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    next(err);
  }
});

router.get("/student", auth, authorizeRoles("student"), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: "course",
        select: "title code credits faculty",
        populate: { path: "faculty", select: "name" },
      })
      .lean();

    const courseIds = enrollments.filter((enrollment) => enrollment.course).map((enrollment) => enrollment.course._id);

    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    const submissions = await AssignmentSubmission.find({
      student: req.user.id,
      assignment: { $in: assignments.map((assignment) => assignment._id) },
    }).lean();

    const assignmentsByCourse = new Map();
    const submissionMap = new Map(submissions.map((submission) => [String(submission.assignment), submission]));
    assignments.forEach((assignment) => {
      const courseKey = String(assignment.course);
      const current = assignmentsByCourse.get(courseKey) || [];
      current.push({
        ...formatAssignment(assignment),
        submission: formatSubmission(submissionMap.get(String(assignment._id))),
      });
      assignmentsByCourse.set(courseKey, current);
    });

    const todayKey = formatDateKey(new Date());
    const summary = {
      courseCount: 0,
      assignmentCount: 0,
      upcomingCount: 0,
      dueTodayCount: 0,
      overdueCount: 0,
      submittedCount: submissions.length,
      pendingCount: 0,
    };

    const items = enrollments
      .filter((enrollment) => enrollment.course)
      .map((enrollment) => {
        const course = enrollment.course;
        const courseAssignments = assignmentsByCourse.get(String(course._id)) || [];

        courseAssignments.forEach((assignment) => {
          const dueKey = formatDateKey(assignment.dueDate);
          summary.assignmentCount += 1;

          if (!assignment.submission) {
            summary.pendingCount += 1;
          }

          if (!dueKey) {
            return;
          }

          if (dueKey < todayKey) {
            summary.overdueCount += 1;
            return;
          }

          if (dueKey === todayKey) {
            summary.dueTodayCount += 1;
            return;
          }

          summary.upcomingCount += 1;
        });

        return {
          course: {
            id: String(course._id),
            title: course.title,
            code: course.code,
            credits: course.credits,
            facultyName: course.faculty?.name || "Unassigned",
          },
          assignments: courseAssignments,
        };
      })
      .sort((left, right) => left.course.title.localeCompare(right.course.title));

    summary.courseCount = items.length;

    res.json({
      items,
      summary,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/student/assignments/:assignmentId/submission",
  auth,
  authorizeRoles("student"),
  handleSubmissionUpload,
  async (req, res, next) => {
    try {
      const assignment = await Assignment.findById(req.params.assignmentId).lean();

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: assignment.course,
      }).lean();

      if (!enrollment) {
        return res.status(403).json({ message: "You are not enrolled in this course" });
      }

      const notes = typeof req.body?.notes === "string" ? req.body.notes.trim() : "";
      const selectedFile = req.file || null;

      if (!notes && !selectedFile) {
        return res.status(400).json({ message: "Add notes or choose a file before submitting" });
      }

      const existingSubmission = await AssignmentSubmission.findOne({
        assignment: assignment._id,
        student: req.user.id,
      });

      let uploadedFile = null;

      if (selectedFile) {
        if (!hasCloudinaryConfig()) {
          return res.status(503).json({ message: "File uploads are not configured on the server" });
        }

        if (existingSubmission?.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(existingSubmission.cloudinaryPublicId, {
              resource_type: "raw",
              invalidate: true,
            });
          } catch (cleanupError) {
            console.error("ASSIGNMENT_SUBMISSION_CLEANUP_ERROR:", cleanupError);
          }
        }

        uploadedFile = await uploadSubmissionFile(
          selectedFile.buffer,
          selectedFile.originalname,
          selectedFile.mimetype
        );
      }

      const submission = await AssignmentSubmission.findOneAndUpdate(
        {
          assignment: assignment._id,
          student: req.user.id,
        },
        {
          course: assignment.course,
          faculty: assignment.faculty,
          notes,
          ...(uploadedFile
            ? {
                fileUrl: uploadedFile.secure_url,
                fileName: selectedFile.originalname,
                fileType: selectedFile.mimetype || null,
                fileSize: selectedFile.size || null,
                cloudinaryPublicId: uploadedFile.public_id,
              }
            : {}),
          submittedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      res.status(201).json({
        message: existingSubmission ? "Assignment resubmitted successfully" : "Assignment submitted successfully",
        submission: formatSubmission(submission),
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;