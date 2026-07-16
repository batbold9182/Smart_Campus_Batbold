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

const normalizeTime = (t) => {
  if (typeof t !== "string") return t;
  const [h, m] = t.split(":");
  if (h === undefined || m === undefined) return t;
  return `${String(parseInt(h, 10)).padStart(2, "0")}:${m.padStart(2, "0")}`;
};

// Mongoose 9 removed callback-style middleware — hooks must be sync/async and
// must NOT take a `next` argument (it is undefined, so calling it throws).
scheduleSchema.pre("validate", function () {
  if (this.startTime) this.startTime = normalizeTime(this.startTime);
  if (this.endTime) this.endTime = normalizeTime(this.endTime);
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    this.invalidate("endTime", "End time must be after start time");
  }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
