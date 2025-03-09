import mongoose from "mongoose";

const managerSchema = new mongoose.Schema({
  managerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hireDate: { type: Date, required: true },
});

const Manager = mongoose.model("Manager", managerSchema);
export default Manager;
