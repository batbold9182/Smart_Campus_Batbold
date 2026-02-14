// wdyzial = faculty
//SIE = department
//
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
    },
    credits: {
      type: Number,
      default: 3,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);
