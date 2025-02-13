// Path: bank-project/models/Employee.js
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: String,
  role: String,
  department: String,
  salary: Number,
  employeeId: String,
  hireDate: Date,
});

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
