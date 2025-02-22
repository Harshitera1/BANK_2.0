import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Transactions from "../models/Transactions.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

// Register User
const registerUser = async (req, res) => {
  console.log("registerUser function called");
  console.log("Request Body:", req.body);

  const { username, password, email, accountNumber } = req.body;

  if (!username || !password || !email || !accountNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.find({ email });
    if (existingUser.length > 0) {
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
  console.log("loginUser function called");
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.find({ email });
    if (user.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user[0]._id);
    return res.status(200).json({
      token,
      user: {
        userId: user[0].userId,
        name: user[0].name,
        email: user[0].email,
        accountNumber: user[0].accountNumber,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ GET Employees
export const getEmployees = async (req, res) => {
  console.log("getEmployees function called");
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET Managers
export const getManagers = async (req, res) => {
  console.log("getManagers function called");
  try {
    const managers = await Manager.find();
    res.status(200).json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET Transactions
export const getTransactions = async (req, res) => {
  console.log("getTransactions function called");
  try {
    const transactions = await Transactions.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET Users
export const getUsers = async (req, res) => {
  console.log("getUsers function called");
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET Customers
export const getCustomers = async (req, res) => {
  console.log("getCustomers function called");
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
  console.log("createEmployee function called");
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
  console.log("updateEmployee function called");
  const { employeeId } = req.params;
  const { name, role, department, salary, hireDate } = req.body;

  try {
    const updatedEmployee = await Employee.find({ employeeId }).then(
      (employee) => {
        if (employee.length > 0) {
          employee[0].name = name;
          employee[0].role = role;
          employee[0].department = department;
          employee[0].salary = salary;
          employee[0].hireDate = hireDate;
          return employee[0].save();
        }
        return null;
      }
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
  console.log("deleteEmployee function called");
  const { employeeId } = req.params;

  try {
    const deletedEmployee = await Employee.find({ employeeId }).then(
      (employee) => {
        if (employee.length > 0) {
          return employee[0].remove();
        }
        return null;
      }
    );

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
  console.log("createManager function called");
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
  console.log("updateManager function called");
  const { managerId } = req.params;
  const { name, department, salary, hireDate } = req.body;

  try {
    const updatedManager = await Manager.find({ managerId }).then((manager) => {
      if (manager.length > 0) {
        manager[0].name = name;
        manager[0].department = department;
        manager[0].salary = salary;
        manager[0].hireDate = hireDate;
        return manager[0].save();
      }
      return null;
    });

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
  console.log("deleteManager function called");
  const { managerId } = req.params;

  try {
    const deletedManager = await Manager.find({ managerId }).then((manager) => {
      if (manager.length > 0) {
        return manager[0].remove();
      }
      return null;
    });

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
  console.log("createTransaction function called");
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
  console.log("deleteTransaction function called");
  const { transactionId } = req.params;

  try {
    const deletedTransaction = await Transactions.find({ transactionId }).then(
      (transaction) => {
        if (transaction.length > 0) {
          return transaction[0].remove();
        }
        return null;
      }
    );

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
  console.log("updateTransaction function called");
  const { transactionId } = req.params;
  const { amount, type, userAccount, date } = req.body; // Corrected field names

  try {
    const updatedTransaction = await Transactions.find({ transactionId }).then(
      (transaction) => {
        if (transaction.length > 0) {
          transaction[0].amount = amount;
          transaction[0].type = type;
          transaction[0].userAccount = userAccount;
          transaction[0].date = date;
          return transaction[0].save();
        }
        return null;
      }
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
  console.log("createUser function called");
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
  console.log("deleteUser function called");
  const { userId } = req.params;

  try {
    const deletedUser = await User.find({ userId }).then((user) => {
      if (user.length > 0) {
        return user[0].remove();
      }
      return null;
    });

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
  console.log("updateUser function called");
  const { userId } = req.params;
  const { name, email, accountNumber, balance } = req.body;

  try {
    const updatedUser = await User.find({ userId }).then((user) => {
      if (user.length > 0) {
        user[0].name = name;
        user[0].email = email;
        user[0].accountNumber = accountNumber;
        user[0].balance = balance;
        return user[0].save();
      }
      return null;
    });

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
