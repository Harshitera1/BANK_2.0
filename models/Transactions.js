// Path: bank-project/models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: String,
  userAccount: String,
  type: String,
  amount: Number,
  date: Date,
  status: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
