require("dotenv").config();

// Validate critical env vars before anything else
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET is missing or too short (minimum 32 characters). Exiting.");
  process.exit(1);
}

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const registerLunchBuddySocket = require("./socket/lunchBuddySocket");
const registerLearningBuddySocket = require("./socket/learningBuddySocket");
const registerPartyBuddySocket = require("./socket/partyBuddySocket");

const crypto = require("crypto");

const app = express();
app.use(compression());
app.use((req, _res, next) => { req.id = crypto.randomUUID(); next(); });
const server = http.createServer(app);
connectDB();

const adminCourseRoutes = require("./routes/adminRoutes/adminCourseRoutes");
const adminEnrollRoutes = require("./routes/adminRoutes/adminEnrollRoutes");
const adminNotificationRoutes = require("./routes/adminRoutes/adminNotificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const scheduleRoutes = require("./routes/adminRoutes/adminScheduleRoutes");
const studentScheduleRoutes = require("./routes/studentRoutes/studentScheduleRoutes");
const adminStudentScheduleRoutes = require("./routes/adminRoutes/adminStudentScheduleRoutes");
const lunchBuddyRoutes = require("./routes/studentRoutes/lunchBuddyRoutes");
const partyBuddyRoutes = require("./routes/studentRoutes/partyBuddyRoutes");
const learningBuddyRoutes = require("./routes/studentRoutes/learningBuddRoutes");
const gradeRoutes = require("./routes/facultyRoutes/gradeRoutes");
const libraryRoutes = require("./routes/studentRoutes/libraryRoutes");
const attendanceRoutes = require("./routes/facultyRoutes/attendanceRoutes");
const assignmentRoutes = require("./routes/facultyRoutes/assignmentRoutes");


const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter((o) => {
        if (isProduction && o.startsWith("http://")) {
          console.warn(`CORS: Rejecting insecure origin in production: ${o}`);
          return false;
        }
        return true;
      })
  : [];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
//for handling large base64 image uploads, set limits to prevent abuse
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 100;

// Strict rate limit for auth endpoints (login, register, forgot-password)
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

app.use("/api/protected", apiLimiter, require("./routes/protectedRoutes"));

app.use("/api/admin", require("./routes/adminRoutes/adminRoutes"));

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

app.use("/api/assignments", assignmentRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Smart Campus Backend is Running");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/ready", (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ status: "unavailable", reason: "database not connected" });
  }
  res.json({ status: "ready" });
});

app.use(errorHandler);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

registerLunchBuddySocket(io);
registerLearningBuddySocket(io);
registerPartyBuddySocket(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

const shutdown = () => {
  console.log("Shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
