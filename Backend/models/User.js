import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: true, unique: true },
  balance: { type: Number, required: true, default: 0 },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "employee", "manager"],
    default: "customer",
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch", // New field to link to Branch
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;
