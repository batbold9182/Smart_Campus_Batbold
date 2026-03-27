const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
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
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    gradedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.models.Grade || mongoose.model("Grade", gradeSchema);