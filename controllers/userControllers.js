import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Transactions from "../models/Transactions.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

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
export async function getTransactions(req, res) {
  try {
    const transactions = await Transactions.find(); // Fetch all transactions
    res.status(200).json(transactions); // Send response with transactions data
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export async function getUsers(req, res) {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users); // Send response with users data
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export async function getCustomers(req, res) {
  try {
    const customers = await Customer.find(); // Fetch all customers
    res.status(200).json(customers); // Send response with customers data
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
