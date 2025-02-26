import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", userRoutes);

// Global error handler for uncaught route/middleware errors
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ message: "An unexpected error occurred." });
});

// Connect to MongoDB without deprecated options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1); // Exit if MongoDB connection fails
  }
};

// Clear port if already in use (optional utility)
const killPort = (port) => {
  return new Promise((resolve, reject) => {
    import("child_process").then(({ exec }) => {
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
  });
};

// Start the server
const startServer = async () => {
  try {
    await killPort(PORT); // Optional: clears port if in use
    await connectDB(); // Connect to MongoDB first
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // Graceful shutdown on termination
    process.on("SIGINT", () => {
      server.close(() => {
        console.log("⚠️ Server closed due to app termination.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the application
startServer();
