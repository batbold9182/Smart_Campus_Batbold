require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/protected", require("./routes/protectedRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));


app.get("/", (req, res) => {
  res.send("🚀 Smart Campus Backend is Running");
});

app.use("/api/protected", require("./routes/protectedRoutes"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
