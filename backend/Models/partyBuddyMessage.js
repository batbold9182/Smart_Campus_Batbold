const mongoose = require("mongoose");

const PartyBuddyMessageSchema = new mongoose.Schema(
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
  mongoose.models.PartyBuddyMessage ||
  mongoose.model("PartyBuddyMessage", PartyBuddyMessageSchema);