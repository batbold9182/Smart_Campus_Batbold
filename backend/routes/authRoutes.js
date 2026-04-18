const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
// NOTE: crypto is still used only to generate the random OTP integer, not for hashing
const nodemailer = require("nodemailer");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const User = require("../models/adminModels/user");

const router = express.Router();

// Password must be 8–128 chars and contain at least one uppercase letter,
// one digit, and one special character.
const PASSWORD_RULES = [
  /[A-Z]/,
  /\d/,
  /[^A-Za-z0-9]/,
];
const passwordValidator = (field) =>
  body(field)
    .isLength({ min: 8, max: 128 }).withMessage("Password must be 8–128 characters")
    .matches(PASSWORD_RULES[0]).withMessage("Password must contain at least one uppercase letter")
    .matches(PASSWORD_RULES[1]).withMessage("Password must contain at least one number")
    .matches(PASSWORD_RULES[2]).withMessage("Password must contain at least one special character");

const RESET_TOKEN_TTL_MINUTES = process.env.RESET_TOKEN_TTL_MINUTES
  ? Number(process.env.RESET_TOKEN_TTL_MINUTES)
  : 15;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Per-email/IP OTP rate limiter: max 5 attempts per 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : req.ip),
  message: { message: "Too many OTP requests, please try again later" },
});

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// REGISTER
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name too long"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail().isLength({ max: 255 }),
    passwordValidator("password"),
  ],
  validate,
  async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    next(err);
  }
});

// LOGIN
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail().isLength({ max: 255 }),
    body("password").notEmpty().withMessage("Password is required").isLength({ max: 128 }),
  ],
  validate,
  async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user)
      return res.status(404).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Wrong password" });

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
});

// FORGOT PASSWORD
router.post(
  "/forgot-password",
  otpLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail().isLength({ max: 255 }),
  ],
  validate,
  async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    const user = await User.findOne({ email });
    if (user) {
      const otp = String(crypto.randomInt(100000, 999999));
      const hashedOtp = await bcrypt.hash(otp, 10);

      user.resetPasswordToken = hashedOtp;
      user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
      await user.save();

      if (process.env.EMAIL_USER) {
        await transporter.sendMail({
          from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your Password Reset OTP",
          text: `Your OTP is: ${otp}\nIt expires in ${RESET_TOKEN_TTL_MINUTES} minutes.`,
          html: `<p>Your OTP is: <strong>${otp}</strong></p><p>It expires in ${RESET_TOKEN_TTL_MINUTES} minutes.</p>`,
        });
      }

      // In dev without email configured, log OTP server-side only
      if (!process.env.EMAIL_USER) {
        console.log(`[DEV] OTP for ${email}: ${otp} (expires in ${RESET_TOKEN_TTL_MINUTES} min)`);
      }
    }

    return res.json({
      message: "If an account exists for this email, an OTP has been sent.",
    });
  } catch (err) {
    next(err);
  }
});

// RESET PASSWORD
router.post(
  "/reset-password",
  otpLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail().isLength({ max: 255 }),
    body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits").isNumeric().withMessage("OTP must be numeric"),
    passwordValidator("newPassword"),
  ],
  validate,
  async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const otp = String(req.body?.otp || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    const user = await User.findOne({
      email,
      resetPasswordToken: { $ne: null },
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    const otpValid = user ? await bcrypt.compare(otp, user.resetPasswordToken) : false;

    if (!user || !otpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
