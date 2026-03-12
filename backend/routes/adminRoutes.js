const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Course = require("../models/course");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const academicHierarchy = require("../config/academicHierarchy");

const router = express.Router();

const isValidAcademicSelection = (school, department, program) => {
  if (!school || !department) return false;
  const departments = academicHierarchy[school];
  if (!departments) return false;
  const programs = departments[department];
  if (!programs) return false;
  if (!program) return true;
  return programs.includes(program);
};

router.get("/academic-options", auth, role("admin"), async (req, res) => {
  return res.json(academicHierarchy);
});

// ✅ Admin creates faculty or student
router.post(
  "/create-faculty",
  auth,
  role("admin"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role: targetRole,
        school,
        department,
        title,
        studentId,
        program,
        yearLevel,
        profile,
      } = req.body;
      const safeRole = targetRole === "student" ? "student" : "faculty";
      const resolvedProfile =
        typeof profile === "string" && profile.trim().length > 0
          ? profile.trim()
          : "defaultProfile.png";

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
      }

      if (safeRole === "faculty" && (!school || !department || !title)) {
        return res
          .status(400)
          .json({ message: "School, department and title are required for faculty" });
      }

      if (safeRole === "faculty" && !isValidAcademicSelection(school, department)) {
        return res.status(400).json({ message: "Invalid school or department selection" });
      }

      if (safeRole === "student" && (!school || !department || !program || !studentId || !yearLevel)) {
        return res
          .status(400)
          .json({ message: "School, department, program, student ID and year level are required for student" });
      }

      if (safeRole === "student" && !isValidAcademicSelection(school, department, program)) {
        return res.status(400).json({ message: "Invalid school, department or program selection" });
      }

      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);

      const createdUser = await User.create({
        name,
        email,
        password: hashed,
        role: safeRole,
        profile: resolvedProfile,
        school: safeRole === "faculty" || safeRole === "student" ? String(school).trim() : null,
        department: safeRole === "faculty" || safeRole === "student" ? String(department).trim() : null,
        title: safeRole === "faculty" ? String(title).trim() : null,
        studentId: safeRole === "student" ? String(studentId).trim() : null,
        program: safeRole === "student" ? String(program).trim() : null,
        yearLevel: safeRole === "student" ? Number(yearLevel) : null,
      });

      const roleLabel = safeRole === "student" ? "Student" : "Faculty";

      res.status(201).json({
        message: `${roleLabel} created successfully`,
        user: {
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          profile: createdUser.profile,
          school: createdUser.school,
          department: createdUser.department,
          title: createdUser.title,
          studentId: createdUser.studentId,
          program: createdUser.program,
          yearLevel: createdUser.yearLevel,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
// ✅ Admin gets all users
router.get("/users", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const role = req.query.role; // faculty or student

  const query = role ? { role } : { role: { $ne: "admin" } };

  const users = await User.find(query)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(query);

  const faculty = await User.countDocuments({ role: "faculty" });
  const students = await User.countDocuments({ role: "student" });
  const disabled = await User.countDocuments({ isActive: false });

  res.json({
    users,
    pagination: {
      page,
      totalPages: Math.ceil(total / limit),
    },
    counters: { faculty, students, disabled },
  });
});


// ❌ DELETE USER (admin only)
router.delete("/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // prevent admin deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});
//Disable / Enable user (admin only)

router.patch("/users/:id/toggle", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: "User status updated", isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all students (for enrollment)
router.get("/students", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await User.find({ role: "student", isActive: true })
      .select("name email")
      .sort({ name: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all courses (for enrollment)
router.get("/courses", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const courses = await Course.find({ isActive: true })
      .select("title code credits")
      .sort({ code: 1 });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
