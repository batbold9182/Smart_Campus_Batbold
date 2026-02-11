const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Admin creates faculty
router.post(
  "/create-faculty",
  auth,
  role("admin"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "User already exists" });

      const hashed = await bcrypt.hash(password, 10);

      const faculty = await User.create({
        name,
        email,
        password: hashed,
        role: "faculty",
      });

      res.status(201).json({
        message: "Faculty created successfully",
        faculty: {
          id: faculty._id,
          name: faculty.name,
          email: faculty.email,
          role: faculty.role,
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


module.exports = router;
