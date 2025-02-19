import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/bankDB"
    );
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

// Function to check if the port is already in use and kill the process
import { exec } from "child_process";

const killPort = (port) => {
  return new Promise((resolve, reject) => {
    exec(`npx kill-port ${port}`, (err, stdout, stderr) => {
      if (err) {
        console.error("⚠️ Error killing port:", err);
        reject(err);
      } else {
        console.log(`✅ Port ${port} cleared.`);
        resolve(stdout);
      }
    });
  });
};

// Start the server
const startServer = async () => {
  await killPort(PORT); // Kill any existing process on the port

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });

  // Handle process termination properly
  process.on("SIGINT", () => {
    server.close(() => {
      console.log("⚠️ Server closed due to app termination.");
      process.exit(0);
    });
  });
};

// Connect to DB and start the server
connectDB().then(startServer);
