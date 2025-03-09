import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
  branchId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User (manager role)
    default: null,
  },
});

const Branch = mongoose.model("Branch", branchSchema);
export default Branch;
