// Path: bank-project/models/Transaction.js
import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
  transactionId: String,
  userAccount: String,
  type: String,
  amount: Number,
  date: Date,
  status: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
