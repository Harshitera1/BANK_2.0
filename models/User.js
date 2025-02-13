// Path: bank-project/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  accountNumber: String,
  balance: Number,
  createdAt: Date,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
