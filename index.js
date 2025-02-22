import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"; // Rename to userRoutes for clarity

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", userRoutes); // Mount routes with /api/users prefix

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

const startServer = async () => {
  await killPort(PORT);
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });

  process.on("SIGINT", () => {
    server.close(() => {
      console.log("⚠️ Server closed due to app termination.");
      process.exit(0);
    });
  });
};
app.get("*", (req, res) => {
  console.log("Unmatched route:", req.path);
  res.status(404).json({ message: "Route not found" });
});
connectDB().then(startServer);
