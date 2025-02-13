import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find(); // Fetch all employees
    res.status(200).json(employees); // Send response with employees data
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export async function getManagers(req, res) {
  try {
    const managers = await Manager.find(); // Fetch all managers
    res.status(200).json(managers); // Send response with managers data
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
