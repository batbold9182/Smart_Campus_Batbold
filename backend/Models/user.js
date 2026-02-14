const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);



module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
