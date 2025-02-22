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
  deposit,
  withdraw,
  transfer,
} from "../controllers/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js"; // Added roleMiddleware

const router = express.Router();

// Public Routes
router.get("/", getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes with RBAC
router.get(
  "/employees",
  authMiddleware,
  roleMiddleware(["manager"]),
  getEmployees
);
router.get(
  "/managers",
  authMiddleware,
  roleMiddleware(["manager"]),
  getManagers
);
router.get(
  "/transactions",
  authMiddleware,
  roleMiddleware(["employee", "manager"]),
  getTransactions
);
router.get(
  "/customers",
  authMiddleware,
  roleMiddleware(["employee", "manager"]),
  getCustomers
);

router.post(
  "/employees",
  authMiddleware,
  roleMiddleware(["manager"]),
  createEmployee
);
router.put(
  "/employees/:employeeId",
  authMiddleware,
  roleMiddleware(["manager"]),
  updateEmployee
);
router.delete(
  "/employees/:employeeId",
  authMiddleware,
  roleMiddleware(["manager"]),
  deleteEmployee
);

router.post(
  "/managers",
  authMiddleware,
  roleMiddleware(["manager"]),
  createManager
);
router.put(
  "/managers/:managerId",
  authMiddleware,
  roleMiddleware(["manager"]),
  updateManager
);
router.delete(
  "/managers/:managerId",
  authMiddleware,
  roleMiddleware(["manager"]),
  deleteManager
);

router.post(
  "/transactions",
  authMiddleware,
  roleMiddleware(["employee", "manager"]),
  createTransaction
);
router.put(
  "/transactions/:transactionId",
  authMiddleware,
  roleMiddleware(["employee", "manager"]),
  updateTransaction
);
router.delete(
  "/transactions/:transactionId",
  authMiddleware,
  roleMiddleware(["employee", "manager"]),
  deleteTransaction
);

router.post("/users", authMiddleware, roleMiddleware(["manager"]), createUser);
router.put(
  "/users/:userId",
  authMiddleware,
  roleMiddleware(["manager"]),
  updateUser
);
router.delete(
  "/users/:userId",
  authMiddleware,
  roleMiddleware(["manager"]),
  deleteUser
);

// Banking Routes (accessible to authenticated users)
router.post("/deposit", authMiddleware, deposit);
router.post("/withdraw", authMiddleware, withdraw);
router.post("/transfer", authMiddleware, transfer);

// Test Routes
router.get("/test", (req, res) => res.json({ message: "Test works" }));
router.get("/protected-route", authMiddleware, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});

export default router;
