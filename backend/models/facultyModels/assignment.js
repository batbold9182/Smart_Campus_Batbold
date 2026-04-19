const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // On create (isNew) the due date must be in the future.
          // Skip on updates so existing records are not broken.
          if (!this.isNew) return true;
          return value > new Date();
        },
        message: "Due date must be in the future",
      },
    },
    maxPoints: {
      type: Number,
      required: true,
      min: 0,
      default: 100,
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
      index: true,
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ course: 1, dueDate: 1 });

module.exports = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);