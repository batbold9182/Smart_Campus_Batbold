require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const registerLunchBuddySocket = require("./socket/lunchBuddySocket");
const registerLearningBuddySocket = require("./socket/learningBuddySocket");
const registerPartyBuddySocket = require("./socket/partyBuddySocket");

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
const partyBuddyRoutes = require("./routes/partyBuddyRoutes.js");
const learningBuddyRoutes = require("./routes/learningBuddRoutes.js");
const gradeRoutes = require("./routes/gradeRoutes.js");
const libraryRoutes = require("./routes/libraryRoutes.js");
const attendanceRoutes = require("./routes/attendanceRoutes.js");


app.use(cors());
//for handling large base64 image uploads, set limits to prevent abuse
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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

app.use("/api/learning-buddy", learningBuddyRoutes);

app.use("/api/party-buddy", partyBuddyRoutes);

app.use("/api/grades", gradeRoutes);

app.use("/api/library", libraryRoutes);

app.use("/api/attendance", attendanceRoutes);

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
registerLearningBuddySocket(io);
registerPartyBuddySocket(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
