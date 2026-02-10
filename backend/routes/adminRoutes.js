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

module.exports = router;
