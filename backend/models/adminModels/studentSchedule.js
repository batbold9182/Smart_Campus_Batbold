const mongoose = require("mongoose");

const studentScheduleSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
  },
  { timestamps: true }
);

studentScheduleSchema.index(
  { student: 1, schedule: 1 },
  { unique: true }
);

module.exports = mongoose.model("StudentSchedule", studentScheduleSchema);
