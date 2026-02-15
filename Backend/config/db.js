const mongoose = require("mongoose");
const logger = require("../controllers/logger"); // Assuming logger.js is in the same directory
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    });
    logger.info("✅ MongoDB Connected");
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
