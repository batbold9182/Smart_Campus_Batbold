const mongoose = require("mongoose");

const LearningBuddyMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LearningBuddyMessage ||
  mongoose.model("LearningBuddyMessage", LearningBuddyMessageSchema);