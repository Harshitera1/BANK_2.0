import Employee from "../models/Employee.js";

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find(); // Fetch all employees
    res.status(200).json(employees); // Send response with employees data
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
