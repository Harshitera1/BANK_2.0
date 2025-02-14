import mongoose from "mongoose";
const customerSchema = new mongoose.Schema({
  name: String,
  department: String,
  salary: Number,
  employeeId: String,
  hireDate: Date,
});
const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
