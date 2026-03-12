const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
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
    },
    department: {
      type: String,
      default: null,
      trim: true,
    },
    title: {
      type: String,
      default: null,
      trim: true,
    },
    studentId: {
      type: String,
      default: null,
      trim: true,
    },
    program: {
      type: String,
      default: null,
      trim: true,
    },
    yearLevel: {
      type: Number,
      default: null,
    },
    employeeId: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);



module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
