import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
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

// Register User
export const registerUser = async (req, res) => {
  console.log("Request Body:", req.body);
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, password, email, accountNumber } = req.body;

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
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

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

// Core Banking Features with Ownership Checks
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

    if (fromAccount === toAccount) {
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same account" });
    }

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

// Existing Functions
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getManagers = async (req, res) => {
  try {
    const managers = await Manager.find();
    res.status(200).json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Placeholder CRUD Functions
export const createEmployee = async (req, res) => {
  res.status(501).json({ message: "Create employee not implemented" });
};

export const updateEmployee = async (req, res) => {
  res.status(501).json({ message: "Update employee not implemented" });
};

export const deleteEmployee = async (req, res) => {
  res.status(501).json({ message: "Delete employee not implemented" });
};

export const createManager = async (req, res) => {
  res.status(501).json({ message: "Create manager not implemented" });
};

export const updateManager = async (req, res) => {
  res.status(501).json({ message: "Update manager not implemented" });
};

export const deleteManager = async (req, res) => {
  res.status(501).json({ message: "Delete manager not implemented" });
};

export const createTransaction = async (req, res) => {
  res.status(501).json({ message: "Create transaction not implemented" });
};

export const updateTransaction = async (req, res) => {
  res.status(501).json({ message: "Update transaction not implemented" });
};

export const deleteTransaction = async (req, res) => {
  res.status(501).json({ message: "Delete transaction not implemented" });
};

export const createUser = async (req, res) => {
  res.status(501).json({ message: "Create user not implemented" });
};

export const updateUser = async (req, res) => {
  res.status(501).json({ message: "Update user not implemented" });
};

export const deleteUser = async (req, res) => {
  res.status(501).json({ message: "Delete user not implemented" });
};
