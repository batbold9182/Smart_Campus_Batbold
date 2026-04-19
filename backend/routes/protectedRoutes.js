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

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Current user profile
 */

/**
 * @swagger
 * /protected/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile (password excluded)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorised
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /protected/profile/picture:
 *   patch:
 *     summary: Update current user's profile picture
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profile]
 *             properties:
 *               profile:
 *                 type: string
 *                 description: Public image URL, base64 data URI, or "defaultProfile.png"
 *     responses:
 *       200:
 *         description: Profile picture updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid image value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
