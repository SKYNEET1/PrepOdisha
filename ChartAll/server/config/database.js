const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the URI from environment variables.
 * Reuses the same database as the PrepOdisha main server so we can
 * query User and Course collections without duplicating data.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Chat Service: MongoDB connected");
  } catch (error) {
    console.error("❌ Chat Service: MongoDB connection failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
