import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Transactions from "../models/Transactions.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

// Register User
const registerUser = async (req, res) => {
  console.log("Request Body:", req.body);

  const { username, password, email, accountNumber } = req.body;

  if (!username || !password || !email || !accountNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      userId: `USR${Date.now()}`,
      name: username,
      email,
      accountNumber,
      balance: 0,
      password: hashedPassword,
    });

    await newUser.save();

    const token = generateToken(newUser._id);
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        accountNumber: newUser.accountNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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

    if (!name || !role || !department || !salary || !employeeId || !hireDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEmployee = new Employee({
      name,
      role,
      department,
      salary,
      employeeId,
      hireDate,
    });

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

// CREATE TRANSACTIONS
export const createTransaction = async (req, res) => {
  try {
    const { transactionId, userAccount, type, amount, date, status } = req.body;

    if (
      !transactionId ||
      !userAccount ||
      !type ||
      !amount ||
      !date ||
      !status
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTransaction = new Transactions({
      transactionId,
      userAccount,
      type,
      amount,
      date: new Date(date),
      status,
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE TRANSACTIONS
export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const deletedTransaction = await Transactions.findOneAndDelete({
      transactionId,
    });

    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE TRANSACTION
export const updateTransaction = async (req, res) => {
  const { transactionId } = req.params;
  const { amount, transactionType, accountNumber, date } = req.body;

  try {
    const updatedTransaction = await Transactions.findOneAndUpdate(
      { transactionId },
      { amount, transactionType, accountNumber, date },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CREATE USER
export const createUser = async (req, res) => {
  try {
    const { userId, name, email, accountNumber, balance } = req.body;

    if (!userId || !name || !email || !accountNumber || balance === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new User({
      userId,
      name,
      email,
      accountNumber,
      balance,
      createdAt: new Date(),
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE USER
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ userId });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE USER
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, accountNumber, balance } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { name, email, accountNumber, balance },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export registerUser and loginUser
export { registerUser, loginUser };
