import express from "express";
import {
  createManager,
  deleteEmployee,
  deleteManager,
  getEmployees,
  updateEmployee,
  updateManager,
  getManagers,
  getTransactions,
  getUsers,
  getCustomers,
  createEmployee,
  createTransaction,
  deleteTransaction,
  updateTransaction,
  updateUser,
  createUser,
  deleteUser,
  registerUser,
  loginUser,
} from "../controllers/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add this route to get all users at /api/users
router.get("/", getUsers); // No authMiddleware
// Protected Routes (require authentication)
router.get("/employees", authMiddleware, getEmployees);
router.get("/managers", authMiddleware, getManagers);
router.get("/transactions", authMiddleware, getTransactions);
// router.get("/users", authMiddleware, getUsers); // Optional: Remove or keep this
router.get("/customers", authMiddleware, getCustomers);
router.post("/employees", authMiddleware, createEmployee);
router.put("/employees/:employeeId", authMiddleware, updateEmployee);
router.delete("/employees/:employeeId", authMiddleware, deleteEmployee);
router.post("/managers", authMiddleware, createManager);
router.put("/managers/:managerId", authMiddleware, updateManager);
router.delete("/managers/:managerId", authMiddleware, deleteManager);
router.post("/transactions", authMiddleware, createTransaction);
router.put("/transactions/:transactionId", authMiddleware, updateTransaction);
router.delete(
  "/transactions/:transactionId",
  authMiddleware,
  deleteTransaction
);
router.post("/users", authMiddleware, createUser);
router.put("/users/:userId", authMiddleware, updateUser);
router.delete("/users/:userId", authMiddleware, deleteUser);

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Test Routes
router.get("/test", (req, res) => res.json({ message: "Test works" }));
router.get("/protected-route", authMiddleware, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});

export default router;
