const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, maxlength: 100 },
    email: { type: String, unique: true, sparse: true, maxlength: 255 },
    password: String,
    profile: {
      type: String,
      required: true,
      default: "defaultProfile.png",
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    school: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    department: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    title: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    studentId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 20,
    },
    program: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    yearLevel: {
      type: Number,
      default: null,
    },
    employeeId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 20,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
