import Employee from "../models/Employee.js";
import Manager from "../models/Manager.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Branch from "../models/Branch.js";
import Customer from "../models/Customer.js"; // Note: Consider consolidating into User
import Joi from "joi";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";
import winston from "winston";
import mongoose from "mongoose"; // Added for transaction sessions

// Configure Winston Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console(),
  ],
});

// Validation Schemas (unchanged from your original)
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  accountNumber: Joi.string().length(10).required(),
  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required(),
  role: Joi.string().valid("customer", "employee", "manager").required(),
});

const createBranchSchema = Joi.object({
  branchId: Joi.string().required(),
  name: Joi.string().required(),
  location: Joi.string().required(),
  managerId: Joi.string().optional(),
});

const updateBranchSchema = Joi.object({
  branchId: Joi.string(),
  name: Joi.string(),
  location: Joi.string(),
  managerId: Joi.string().allow(null),
}).min(1);

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

  const { name, password, email, accountNumber, role, branchId } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    const existingManager = await Manager.findOne({ email });
    const existingEmployee = await Employee.findOne({ email });
    if (existingUser || existingManager || existingEmployee)
      return res.status(400).json({ message: "User already exists" });

    if ((role === "employee" || role === "manager") && branchId) {
      const branch = await Branch.findById(branchId);
      if (!branch)
        return res.status(400).json({ message: "Invalid branch ID" });
    }

    const hashedPassword = await hashPassword(password);

    let userRecord, managerRecord, employeeRecord;
    if (role === "manager") {
      userRecord = new User({
        userId: `USR${Date.now()}`,
        name,
        email,
        accountNumber,
        balance: 0,
        password: hashedPassword,
        role,
        branchId: branchId || null,
      });
      await userRecord.save();

      managerRecord = new Manager({
        managerId: `MGR${Date.now()}`,
        name,
        email,
        department: "Default Department",
        hireDate: new Date(),
      });
      await managerRecord.save();

      if (branchId) {
        await Branch.findByIdAndUpdate(branchId, { managerId: userRecord._id });
      }

      const token = generateToken(userRecord._id, role);
      logger.info(`Manager registered: ${email}, Role: ${role}`); // Audit log
      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: userRecord._id,
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role,
          branchId: userRecord.branchId,
        },
      });
    } else if (role === "employee") {
      userRecord = new User({
        userId: `USR${Date.now()}`,
        name,
        email,
        accountNumber,
        balance: 0,
        password: hashedPassword,
        role,
        branchId: branchId || null,
      });
      await userRecord.save();

      employeeRecord = new Employee({
        name,
        role: "Default Role",
        department: "Default Department",
        salary: 0,
        employeeId: `EMP${Date.now()}`,
        hireDate: new Date(),
      });
      await employeeRecord.save();

      const token = generateToken(userRecord._id, role);
      logger.info(`Employee registered: ${email}, Role: ${role}`); // Audit log
      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: userRecord._id,
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role,
          branchId: userRecord.branchId,
        },
      });
    } else {
      userRecord = new User({
        userId: `USR${Date.now()}`,
        name,
        email,
        accountNumber,
        balance: 0,
        password: hashedPassword,
        role,
      });
      await userRecord.save();

      const token = generateToken(userRecord._id, role);
      logger.info(`Customer registered: ${email}, Role: ${role}`); // Audit log
      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: userRecord._id,
          name: userRecord.name,
          email: userRecord.email,
          accountNumber: userRecord.accountNumber,
          role: userRecord.role,
        },
      });
    }
  } catch (error) {
    logger.error(`Registration failed: ${error.message}`); // Error log
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
    logger.info(`User logged in: ${email}, Role: ${user.role}`); // Audit log
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
    logger.error(`Login failed: ${error.message}`); // Error log
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

    logger.info(`Deposit of ${amount} to account ${accountNumber}`); // Audit log
    res
      .status(200)
      .json({ message: "Deposit successful", balance: user.balance });
  } catch (error) {
    logger.error(`Deposit failed: ${error.message}`); // Error log
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

    logger.info(`Withdrawal of ${amount} from account ${accountNumber}`); // Audit log
    res
      .status(200)
      .json({ message: "Withdrawal successful", balance: user.balance });
  } catch (error) {
    logger.error(`Withdrawal failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fromAccount, toAccount, amount } = req.body;
    const { error } = transferSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const currentUser = await User.findById(req.user.userId).session(session);
    if (!currentUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    if (
      currentUser.role === "customer" &&
      currentUser.accountNumber !== fromAccount
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "You can only transfer from your own account" });
    }

    const sender = await User.findOne({ accountNumber: fromAccount }).session(
      session
    );
    const receiver = await User.findOne({ accountNumber: toAccount }).session(
      session
    );

    if (!sender || !receiver) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Account not found" });
    }
    if (sender.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient funds" });
    }
    if (fromAccount === toAccount) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same account" });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save({ session });
    await receiver.save({ session });

    const senderTransactionId = `TXN${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const receiverTransactionId = `TXN${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    await Transaction.create(
      [
        {
          transactionId: senderTransactionId,
          userAccount: fromAccount,
          type: "transfer_out",
          amount: -amount,
          date: new Date(),
          status: "completed",
        },
        {
          transactionId: receiverTransactionId,
          userAccount: toAccount,
          type: "transfer_in",
          amount,
          date: new Date(),
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info(`Transfer of ${amount} from ${fromAccount} to ${toAccount}`); // Audit log
    res
      .status(200)
      .json({ message: "Transfer successful", balance: sender.balance });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Transfer failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Branches
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().populate("managerId", "name email");
    logger.info(`Branches fetched by user: ${req.user.email}`); // Audit log
    res.status(200).json(branches);
  } catch (error) {
    logger.error(`Error fetching branches: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const createBranch = async (req, res) => {
  const { error } = createBranchSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { branchId, name, location, managerId } = req.body;

  try {
    const existingBranch = await Branch.findOne({ branchId });
    if (existingBranch)
      return res.status(400).json({ message: "Branch ID already exists" });

    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== "manager")
        return res.status(400).json({ message: "Invalid manager ID" });
    }

    const newBranch = new Branch({
      branchId,
      name,
      location,
      managerId: managerId || null,
    });
    await newBranch.save();

    if (managerId) {
      await User.findByIdAndUpdate(managerId, { branchId: newBranch._id });
    }

    logger.info(`Branch created: ${branchId}, Name: ${name}`); // Audit log
    res.status(201).json(newBranch);
  } catch (error) {
    logger.error(`Branch creation failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const updateBranch = async (req, res) => {
  const { error } = updateBranchSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { branchId } = req.params;
  const updateData = req.body;

  try {
    const branch = await Branch.findOne({ branchId });
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    if (updateData.managerId) {
      const manager = await User.findById(updateData.managerId);
      if (!manager || manager.role !== "manager")
        return res.status(400).json({ message: "Invalid manager ID" });
    }

    const oldManagerId = branch.managerId;
    Object.assign(branch, updateData);
    await branch.save();

    if (updateData.managerId && updateData.managerId !== oldManagerId) {
      await User.findByIdAndUpdate(updateData.managerId, {
        branchId: branch._id,
      });
      if (oldManagerId) {
        await User.findByIdAndUpdate(oldManagerId, { branchId: null });
      }
    }

    logger.info(`Branch updated: ${branchId}`); // Audit log
    res.status(200).json(branch);
  } catch (error) {
    logger.error(`Branch update failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  const { branchId } = req.params;

  try {
    const branch = await Branch.findOne({ branchId });
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const managerId = branch.managerId;
    await branch.deleteOne();

    if (managerId) {
      await User.findByIdAndUpdate(managerId, { branchId: null });
    }
    await User.updateMany({ branchId: branch._id }, { branchId: null });

    logger.info(`Branch deleted: ${branchId}`); // Audit log
    res.status(200).json({ message: "Branch deleted successfully" });
  } catch (error) {
    logger.error(`Branch deletion failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    logger.info(`Employees fetched by user: ${req.user.email}`); // Audit log
    res.status(200).json(employees);
  } catch (error) {
    logger.error(`Error fetching employees: ${error.message}`); // Error log
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

    logger.info(`Employee created: ${employeeId}, Name: ${name}`); // Audit log
    res.status(201).json(newEmployee);
  } catch (error) {
    logger.error(`Employee creation failed: ${error.message}`); // Error log
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

    logger.info(`Employee updated: ${employeeId}`); // Audit log
    res.status(200).json(employee);
  } catch (error) {
    logger.error(`Employee update failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    await employee.deleteOne();
    logger.info(`Employee deleted: ${employeeId}`); // Audit log
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    logger.error(`Employee deletion failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Managers
export const getManagers = async (req, res) => {
  try {
    const managers = await Manager.find();
    logger.info(`Managers fetched by user: ${req.user.email}`); // Audit log
    res.status(200).json(managers);
  } catch (error) {
    logger.error(`Error fetching managers: ${error.message}`); // Error log
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

    logger.info(`Manager created: ${managerId}, Name: ${name}`); // Audit log
    res.status(201).json(newManager);
  } catch (error) {
    logger.error(`Manager creation failed: ${error.message}`); // Error log
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

    logger.info(`Manager updated: ${managerId}`); // Audit log
    res.status(200).json(manager);
  } catch (error) {
    logger.error(`Manager update failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const deleteManager = async (req, res) => {
  const { managerId } = req.params;

  try {
    const manager = await Manager.findOne({ managerId });
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    await manager.deleteOne();
    logger.info(`Manager deleted: ${managerId}`); // Audit log
    res.status(200).json({ message: "Manager deleted successfully" });
  } catch (error) {
    logger.error(`Manager deletion failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    logger.info(`Transactions fetched by user: ${req.user.email}`); // Audit log
    res.status(200).json(transactions);
  } catch (error) {
    logger.error(`Error fetching transactions: ${error.message}`); // Error log
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

    logger.info(`Transaction created: ${transactionId}, Type: ${type}`); // Audit log
    res.status(201).json(newTransaction);
  } catch (error) {
    logger.error(`Transaction creation failed: ${error.message}`); // Error log
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

    logger.info(`Transaction updated: ${transactionId}`); // Audit log
    res.status(200).json(transaction);
  } catch (error) {
    logger.error(`Transaction update failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    await transaction.deleteOne();
    logger.info(`Transaction deleted: ${transactionId}`); // Audit log
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    logger.error(`Transaction deletion failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    logger.info(`Users fetched by user: ${req.user.email}`); // Audit log
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`); // Error log
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
    logger.info(`User created: ${email}, Role: ${role}`); // Audit log
    res.status(201).json(newUser);
  } catch (error) {
    logger.error(`User creation failed: ${error.message}`); // Error log
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
    logger.info(`User updated: ${userId}`); // Audit log
    res.status(200).json(user);
  } catch (error) {
    logger.error(`User update failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    logger.info(`User deleted: ${userId}`); // Audit log
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error(`User deletion failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

// CRUD for Customers (Note: Consider consolidating into User model)
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    logger.info(`Customers fetched by user: ${req.user.email}`); // Audit log
    res.status(200).json(customers);
  } catch (error) {
    logger.error(`Error fetching customers: ${error.message}`); // Error log
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

    logger.info(`Customer created: ${employeeId}, Name: ${name}`); // Audit log
    res.status(201).json(newCustomer);
  } catch (error) {
    logger.error(`Customer creation failed: ${error.message}`); // Error log
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

    logger.info(`Customer updated: ${employeeId}`); // Audit log
    res.status(200).json(customer);
  } catch (error) {
    logger.error(`Customer update failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const customer = await Customer.findOne({ employeeId });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    await customer.deleteOne();
    logger.info(`Customer deleted: ${employeeId}`); // Audit log
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    logger.error(`Customer deletion failed: ${error.message}`); // Error log
    res.status(500).json({ message: error.message });
  }
};
