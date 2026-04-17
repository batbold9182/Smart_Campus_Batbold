const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      default: null,
      index: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Attendance date cannot be in the future",
      },
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, course: 1, date: 1, schedule: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);