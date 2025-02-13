// Path: bank-project/models/Manager.js
const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema({
  name: String,
  department: String,
  email: String,
  hireDate: Date,
  managerId: String,
});

const Manager = mongoose.model("Manager", managerSchema);
module.exports = Manager;
