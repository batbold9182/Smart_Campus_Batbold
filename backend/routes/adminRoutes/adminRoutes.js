const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../../models/adminModels/user");
const Course = require("../../models/adminModels/course");
const auth = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");
const academicHierarchy = require("../../config/academicHierarchy");

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

router.get("/academic-options", auth, authorizeRoles("admin"), async (req, res, next) => {
  return res.json(academicHierarchy);
});

// ✅ Admin creates faculty or student
router.post(
  "/create-faculty",
  auth,
  authorizeRoles("admin"),
  async (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
        role: targetRole,
        school,
        department,
        title,
        employeeId,
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

      if (
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 128 ||
        !/[A-Z]/.test(password) ||
        !/\d/.test(password) ||
        !/[^A-Za-z0-9]/.test(password)
      ) {
        return res.status(400).json({
          message:
            "Password must be 8–128 characters and contain at least one uppercase letter, one number, and one special character",
        });
      }

      if (safeRole === "faculty" && (!school || !department || !title || !employeeId)) {
        return res
          .status(400)
          .json({ message: "School, department, title and employee ID are required for faculty" });
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

      const exists = await User.findOne({ email }).lean();
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
        employeeId: safeRole === "faculty" ? String(employeeId).trim() : null,
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
          employeeId: createdUser.employeeId,
          studentId: createdUser.studentId,
          program: createdUser.program,
          yearLevel: createdUser.yearLevel,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);
// ✅ Admin gets all users
router.get("/users", auth, authorizeRoles("admin"), async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 100);
  const role = req.query.role; // faculty or student

  const query = role ? { role } : { role: { $ne: "admin" } };

  const users = await User.find(query)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(query);

  const faculty = await User.countDocuments({ role: "faculty" });
  const students = await User.countDocuments({ role: "student" });
  const disabled = await User.countDocuments({ isActive: false });

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    counters: { faculty, students, disabled },
  });
});


// ❌ DELETE USER (admin only)
router.delete("/users/:id", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    // prevent admin deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

// ✅ Update user information (admin only)
router.patch("/users/:id", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const { name, email, school, department, title, employeeId, studentId, program, yearLevel } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email }).lean();
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    // Update basic fields
    if (name) user.name = name;
    
    // Update academic fields
    if (school !== undefined) user.school = school || null;
    if (department !== undefined) user.department = department || null;

    // Update faculty-specific fields
    if (user.role === "faculty" && title !== undefined) {
      user.title = title || null;
    }
    if (user.role === "faculty" && employeeId !== undefined) {
      user.employeeId = employeeId || null;
    }

    // Update student-specific fields
    if (user.role === "student") {
      if (studentId !== undefined) user.studentId = studentId || null;
      if (program !== undefined) {
        // Validate program if changing school/department
        const validateSchool = school || user.school;
        const validateDept = department || user.department;
        if (validateSchool && validateDept && program && !isValidAcademicSelection(validateSchool, validateDept, program)) {
          return res.status(400).json({ message: "Invalid program for selected school/department" });
        }
        user.program = program || null;
      }
      if (yearLevel !== undefined) user.yearLevel = yearLevel || null;
    }

    await user.save();
    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ message: "User updated successfully", user: safeUser });
  } catch (err) {
    next(err);
  }
});

//Disable / Enable user (admin only)

router.patch("/users/:id/toggle", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: "User status updated", isActive: user.isActive });
  } catch (err) {
    next(err);
  }
});

// ✅ Get all students (for enrollment)
router.get("/students", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const students = await User.find({ role: "student", isActive: true })
      .select("name email")
      .sort({ name: 1 })
      .lean();

    res.json(students);
  } catch (err) {
    next(err);
  }
});

// ✅ Get all courses (for enrollment)
router.get("/courses", auth, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const courses = await Course.find({ isActive: true })
      .select("title code credits")
      .sort({ code: 1 })
      .lean();

    res.json(courses);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
