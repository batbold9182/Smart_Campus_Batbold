const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const User = require("../models/user");

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("PROFILE ROUTE ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/admin", auth, role("admin"), (req, res) => {
  res.json({ message: "Welcome, admin!" });
}
);

router.get("/student", auth, role("student"), (req, res) => {
  res.json({ message: "Welcome, student!" });
}
);


module.exports = router;
