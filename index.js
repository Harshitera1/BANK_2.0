// index.js
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes"); // Import user routes

const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Use user routes
app.use("/api", userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
