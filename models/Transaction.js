import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  userAccount: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: String, required: true },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
