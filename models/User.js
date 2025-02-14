// Path: bank-project/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  accountNumber: String,
  balance: Number,
  createdAt: Date,
});

const User = mongoose.model("User", userSchema);
export default User;
