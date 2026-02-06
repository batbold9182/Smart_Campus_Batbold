const express = require("express");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", auth, async (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = router;
