const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const User = require("../models/adminModels/user");
const { cloudinary, hasCloudinaryConfig } = require("../config/cloudinary");

const isBlockedLocalScheme = (value) => {
  const v = value.toLowerCase();
  return (
    v.startsWith("file://") ||
    v.startsWith("blob:") ||
    v.startsWith("ph://") ||
    v.startsWith("content://") ||
    v.startsWith("assets-library://")
  );
};

const isHttpUrl = (value) => {
  const v = value.toLowerCase();
  return v.startsWith("http://") || v.startsWith("https://");
};

const isDataImage = (value) => value.toLowerCase().startsWith("data:image/");

router.get("/profile", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.patch("/profile/picture", auth, async (req, res, next) => {
  try {
    const { profile } = req.body;

    if (typeof profile !== "string" || !profile.trim()) {
      return res.status(400).json({ message: "Profile picture value is required" });
    }

    const nextProfile = profile.trim();

    if (isBlockedLocalScheme(nextProfile)) {
      return res.status(400).json({
        message: "Local device image paths are not supported. Upload and save a public URL instead.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let resolvedProfile = nextProfile;

    if (nextProfile !== "defaultProfile.png" && isDataImage(nextProfile)) {
      if (hasCloudinaryConfig()) {
        const uploadResult = await cloudinary.uploader.upload(nextProfile, {
          folder: "smart-campus/profiles",
          resource_type: "image",
        });

        resolvedProfile = uploadResult.secure_url;
      } else {
        // Fallback for local development when cloud storage is not configured.
        resolvedProfile = nextProfile;
      }
    }

    if (
      resolvedProfile !== "defaultProfile.png" &&
      !isHttpUrl(resolvedProfile) &&
      !isDataImage(resolvedProfile)
    ) {
      return res.status(400).json({
        message: "Profile picture must be a public image URL, a data image, or default profile.",
      });
    }

    user.profile = resolvedProfile;
    await user.save();

    return res.json({
      message: "Profile picture updated",
      profile: user.profile,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/admin", auth, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome, admin!" });
}
);

router.get("/student", auth, authorizeRoles("student"), (req, res) => {
  res.json({ message: "Welcome, student!" });
}
);


module.exports = router;
