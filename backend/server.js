require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const registerLunchBuddySocket = require("./socket/lunchBuddySocket");

const app = express();
const server = http.createServer(app);
connectDB();

const adminCourseRoutes = require("./routes/adminCourseRoutes");
const adminEnrollRoutes = require("./routes/adminEnrollRoutes.js");
const adminNotificationRoutes = require("./routes/adminNotificationRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const scheduleRoutes = require("./routes/adminScheduleRoutes.js");
const studentScheduleRoutes = require("./routes/studentScheduleRoutes.js");
const adminStudentScheduleRoutes = require("./routes/adminStudentScheduleRoutes.js");
const lunchBuddyRoutes = require("./routes/lunchBuddyRoutes.js");

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

app.use("/api/admin", adminStudentScheduleRoutes);

app.use("/api/lunch-buddy", lunchBuddyRoutes);


app.get("/", (req, res) => {
  res.send("🚀 Smart Campus Backend is Running");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

registerLunchBuddySocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
