// Path: bank-project/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Unique User ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: true, unique: true },
  balance: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now }, // Automatically set the creation date
});

const User = mongoose.model("User", userSchema);
export default User;
