import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Transactions from "../models/Transactions.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

// ✅ GET Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET Managers
export const getManagers = async (req, res) => {
  try {
    const managers = await Manager.find();
    res.status(200).json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET Transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transactions.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET Customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------- CRUD for Employees ---------------------

// ✅  POST Create Employee
export const createEmployee = async (req, res) => {
  try {
    const { name, role, department, salary, employeeId, hireDate } = req.body;

    // Validate required fields
    if (!name || !role || !department || !salary || !employeeId || !hireDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new employee with validated fields
    const newEmployee = new Employee({
      name,
      role,
      department,
      salary,
      employeeId,
      hireDate,
    });

    // Save to database
    await newEmployee.save();

    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Employee
export const updateEmployee = async (req, res) => {
  const { employeeId } = req.params;
  const { name, role, department, salary, hireDate } = req.body;

  try {
    const updatedEmployee = await Employee.findOneAndUpdate(
      { employeeId },
      { name, role, department, salary, hireDate },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Employee
export const deleteEmployee = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const deletedEmployee = await Employee.findOneAndDelete({ employeeId });

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --------------------- CRUD for Managers ---------------------

// ✅ Create Manager
export const createManager = async (req, res) => {
  try {
    const { name, department, email, hireDate, managerId } = req.body;

    if (!name || !department || !email || !hireDate || !managerId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newManager = new Manager({
      name,
      department,
      email,
      hireDate: new Date(hireDate),
      managerId,
    });

    await newManager.save();
    res.status(201).json(newManager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Manager
export const updateManager = async (req, res) => {
  const { managerId } = req.params;
  const { name, department, salary, hireDate } = req.body;

  try {
    const updatedManager = await Manager.findOneAndUpdate(
      { managerId },
      { name, department, salary, hireDate },
      { new: true }
    );

    if (!updatedManager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    res.status(200).json(updatedManager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Manager
export const deleteManager = async (req, res) => {
  const { managerId } = req.params;

  try {
    const deletedManager = await Manager.findOneAndDelete({ managerId });

    if (!deletedManager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    res.status(200).json({ message: "Manager deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
