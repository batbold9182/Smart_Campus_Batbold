const mongoose = require("mongoose");

const MAX_RETRIES = 5;

const connectDB = async (attempt = 1) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error(`❌ MongoDB connection attempt ${attempt} failed: ${err.message}`);
    if (attempt >= MAX_RETRIES) {
      console.error("MongoDB connection failed after max retries. Exiting.");
      process.exit(1);
    }
    const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s, 8s, 16s
    console.log(`⏳ Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectDB(attempt + 1);
  }
};

module.exports = connectDB;
