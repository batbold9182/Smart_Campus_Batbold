require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

const adminCourseRoutes = require("./routes/adminCourseRoutes");
const adminEnrollRoutes = require("./routes/adminEnrollRoutes.js");

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/protected", require("./routes/protectedRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/admin", adminCourseRoutes);

app.use("/api/admin", adminEnrollRoutes);

app.use("/api/courses", require("./routes/courseRoutes"));

app.get("/", (req, res) => {
  res.send("🚀 Smart Campus Backend is Running");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
