import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js"; // Note: Consider consolidating into User
import Joi from "joi";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

// Validation Schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
  accountNumber: Joi.string().length(10).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const depositSchema = Joi.object({
  accountNumber: Joi.string().length(10).required(),
  amount: Joi.number().positive().required(),
});

const withdrawSchema = Joi.object({
  accountNumber: Joi.string().length(10).required(),
  amount: Joi.number().positive().required(),
});

const transferSchema = Joi.object({
  fromAccount: Joi.string().length(10).required(),
  toAccount: Joi.string().length(10).required(),
  amount: Joi.number().positive().required(),
});

const createEmployeeSchema = Joi.object({
  name: Joi.string().required(),
  role: Joi.string().required(),
  department: Joi.string().required(),
  salary: Joi.number().positive().required(),
  employeeId: Joi.string().required(),
  hireDate: Joi.date().required(),
});

const updateEmployeeSchema = Joi.object({
  name: Joi.string(),
  role: Joi.string(),
  department: Joi.string(),
  salary: Joi.number().positive(),
  employeeId: Joi.string(),
  hireDate: Joi.date(),
}).min(1);

const createManagerSchema = Joi.object({
  managerId: Joi.string().required(),
  name: Joi.string().required(),
  department: Joi.string().required(),
  email: Joi.string().email().required(),
  hireDate: Joi.date().required(),
});

const updateManagerSchema = Joi.object({
  managerId: Joi.string(),
  name: Joi.string(),
  department: Joi.string(),
  email: Joi.string().email(),
  hireDate: Joi.date(),
}).min(1);

const createTransactionSchema = Joi.object({
  transactionId: Joi.string().required(),
  userAccount: Joi.string().required(),
  type: Joi.string().required(),
  amount: Joi.number().required(),
  date: Joi.date().required(),
  status: Joi.string().required(),
});

const updateTransactionSchema = Joi.object({
  transactionId: Joi.string(),
  userAccount: Joi.string(),
  type: Joi.string(),
  amount: Joi.number(),
  date: Joi.date(),
  status: Joi.string(),
}).min(1);

const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  accountNumber: Joi.string().length(10).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("customer", "employee", "manager").required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  accountNumber: Joi.string().length(10),
  password: Joi.string().min(6),
  role: Joi.string().valid("customer", "employee", "manager"),
}).min(1);

const createCustomerSchema = Joi.object({
  name: Joi.string().required(),
  department: Joi.string().required(),
  salary: Joi.number().positive().required(),
  employeeId: Joi.string().required(),
  hireDate: Joi.date().required(),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string(),
  department: Joi.string(),
  salary: Joi.number().positive(),
  employeeId: Joi.string(),
  hireDate: Joi.date(),
}).min(1);

// Register User
export const registerUser = async (req, res) => {
  console.log("Request Body:", req.body);
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, password, email, accountNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      userId: `USR${Date.now()}`,
      name: username,
      email,
      accountNumber,
      balance: 0,
      password: hashedPassword,
      role: "customer",
    });

    await newUser.save();

    const token = generateToken(newUser._id, newUser.role);
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        accountNumber: newUser.accountNumber,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Banking Functions
export const deposit = async (req, res) => {
  const { error } = depositSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { accountNumber, amount } = req.body;

  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    if (
      currentUser.role === "customer" &&
      currentUser.accountNumber !== accountNumber
    ) {
      return res
        .status(403)
        .json({ message: "You can only deposit to your own account" });
    }

    const user = await User.findOne({ accountNumber });
    if (!user) return res.status(404).json({ message: "Account not found" });

    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      transactionId: `TXN${Date.now()}`,
      userAccount: accountNumber,
      type: "deposit",
      amount,
      date: new Date(),
      status: "completed",
    });
    await transaction.save();

    res
      .status(200)
      .json({ message: "Deposit successful", balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const withdraw = async (req, res) => {
  const { error } = withdrawSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { accountNumber, amount } = req.body;

  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    if (
      currentUser.role === "customer" &&
      currentUser.accountNumber !== accountNumber
    ) {
      return res
        .status(403)
        .json({ message: "You can only withdraw from your own account" });
    }

    const user = await User.findOne({ accountNumber });
    if (!user) return res.status(404).json({ message: "Account not found" });
    if (user.balance < amount)
      return res.status(400).json({ message: "Insufficient funds" });

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      transactionId: `TXN${Date.now()}`,
      userAccount: accountNumber,
      type: "withdrawal",
      amount: -amount,
      date: new Date(),
      status: "completed",
    });
    await transaction.save();

    res
      .status(200)
      .json({ message: "Withdrawal successful", balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const transfer = async (req, res) => {
  const { error } = transferSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { fromAccount, toAccount, amount } = req.body;

  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });

    if (
      currentUser.role === "customer" &&
      currentUser.accountNumber !== fromAccount
    ) {
      return res
        .status(403)
        .json({ message: "You can only transfer from your own account" });
    }

    const sender = await User.findOne({ accountNumber: fromAccount });
    const receiver = await User.findOne({ accountNumber: toAccount });

    if (!sender || !receiver)
      return res.status(404).json({ message: "Account not found" });
    if (sender.balance < amount)
      return res.status(400).json({ message: "Insufficient funds" });
    if (fromAccount === toAccount)
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same account" });

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    const transactionId = `TXN${Date.now()}`;
    const senderTransaction = new Transaction({
      transactionId,
      userAccount: fromAccount,
      type: "transfer_out",
      amount: -amount,
      date: new Date(),
      status: "completed",
    });
    const receiverTransaction = new Transaction({
      transactionId,
      userAccount: toAccount,
      type: "transfer_in",
      amount,
      date: new Date(),
      status: "completed",
    });

    await senderTransaction.save();
    await receiverTransaction.save();

    res
      .status(200)
      .json({ message: "Transfer successful", balance: sender.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  const { error } = createEmployeeSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, role, department, salary, employeeId, hireDate } = req.body;

  try {
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee)
      return res.status(400).json({ message: "Employee ID already exists" });

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

export const updateEmployee = async (req, res) => {
  const { error } = updateEmployeeSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { employeeId } = req.params;
  const updateData = req.body;

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    Object.assign(employee, updateData);
    await employee.save();
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    await employee.remove();
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Managers
export const getManagers = async (req, res) => {
  try {
    const managers = await Manager.find();
    res.status(200).json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createManager = async (req, res) => {
  const { error } = createManagerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { managerId, name, department, email, hireDate } = req.body;

  try {
    const existingManager = await Manager.findOne({ managerId });
    if (existingManager)
      return res.status(400).json({ message: "Manager ID already exists" });

    const newManager = new Manager({
      managerId,
      name,
      department,
      email,
      hireDate,
    });
    await newManager.save();
    res.status(201).json(newManager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateManager = async (req, res) => {
  const { error } = updateManagerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { managerId } = req.params;
  const updateData = req.body;

  try {
    const manager = await Manager.findOne({ managerId });
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    Object.assign(manager, updateData);
    await manager.save();
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteManager = async (req, res) => {
  const { managerId } = req.params;

  try {
    const manager = await Manager.findOne({ managerId });
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    await manager.remove();
    res.status(200).json({ message: "Manager deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  const { error } = createTransactionSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { transactionId, userAccount, type, amount, date, status } = req.body;

  try {
    const existingTransaction = await Transaction.findOne({ transactionId });
    if (existingTransaction)
      return res.status(400).json({ message: "Transaction ID already exists" });

    const newTransaction = new Transaction({
      transactionId,
      userAccount,
      type,
      amount,
      date,
      status,
    });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  const { error } = updateTransactionSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { transactionId } = req.params;
  const updateData = req.body;

  try {
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    Object.assign(transaction, updateData);
    await transaction.save();
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    await transaction.remove();
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { error } = createUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, accountNumber, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      userId: `USR${Date.now()}`,
      name,
      email,
      accountNumber,
      balance: 0,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { error } = updateUserSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { userId } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (updateData.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser && existingUser.userId !== userId) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (updateData.accountNumber) {
      const existingUser = await User.findOne({
        accountNumber: updateData.accountNumber,
      });
      if (existingUser && existingUser.userId !== userId) {
        return res
          .status(400)
          .json({ message: "Account number already exists" });
      }
    }

    for (const key in updateData) {
      if (key === "password") {
        user.password = await hashPassword(updateData[key]);
      } else {
        user[key] = updateData[key];
      }
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Customers (Note: Consider consolidating into User model)
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  const { error } = createCustomerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, department, salary, employeeId, hireDate } = req.body;

  try {
    const existingCustomer = await Customer.findOne({ employeeId });
    if (existingCustomer)
      return res.status(400).json({ message: "Customer ID already exists" });

    const newCustomer = new Customer({
      name,
      department,
      salary,
      employeeId,
      hireDate,
    });
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  const { error } = updateCustomerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { employeeId } = req.params;
  const updateData = req.body;

  try {
    const customer = await Customer.findOne({ employeeId });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    Object.assign(customer, updateData);
    await customer.save();
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const customer = await Customer.findOne({ employeeId });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    await customer.remove();
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
