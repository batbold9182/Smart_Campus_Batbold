require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

const adminCourseRoutes = require("./routes/adminCourseRoutes");
const adminEnrollRoutes = require("./routes/adminEnrollRoutes.js");
const adminNotificationRoutes = require("./routes/adminNotificationRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const scheduleRoutes = require("./routes/adminScheduleRoutes.js");
const studentScheduleRoutes = require("./routes/studentScheduleRoutes.js");
const adminStudentScheduleRoutes = require("./routes/adminStudentScheduleRoutes.js");

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/protected", require("./routes/protectedRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/admin", adminCourseRoutes);

app.use("/api/admin", adminEnrollRoutes);

app.use("/api/courses", require("./routes/courseRoutes"));

app.use("/api/admin", adminNotificationRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/admin", scheduleRoutes);

app.use("/api/schedule", studentScheduleRoutes);
app.use("/api/schedules", studentScheduleRoutes);

app.use("/api/admin", adminStudentScheduleRoutes);


app.get("/", (req, res) => {
  res.send("🚀 Smart Campus Backend is Running");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
