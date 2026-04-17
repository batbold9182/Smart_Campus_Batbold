const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: {
      type: String, // "09:00"
      required: true,
    },
    endTime: {
      type: String, // "10:30"
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

scheduleSchema.index({ day: 1, startTime: 1 });
scheduleSchema.index({ course: 1, faculty: 1, day: 1, startTime: 1 }, { unique: true });

scheduleSchema.pre("validate", function (next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    this.invalidate("endTime", "End time must be after start time");
  }
  next();
});

module.exports = mongoose.model("Schedule", scheduleSchema);
