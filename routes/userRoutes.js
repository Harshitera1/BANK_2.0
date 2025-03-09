import express from "express";
import {
  createManager,
  deleteManager,
  updateManager,
  getManagers,
  createEmployee,
  deleteEmployee,
  updateEmployee,
  getEmployees,
  createTransaction,
  deleteTransaction,
  updateTransaction,
  getTransactions,
  createUser,
  deleteUser,
  updateUser,
  getUsers,
  createCustomer,
  deleteCustomer,
  updateCustomer,
  getCustomers,
  registerUser,
  loginUser,
  deposit,
  withdraw,
  transfer,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

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

router.get(
  "/managers",
  authMiddleware,
  roleMiddleware(["manager"]),
  getManagers
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

router.get(
  "/transactions",
  authMiddleware,
  roleMiddleware(["employee", "manager"]),
  getTransactions
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

router.get("/users", authMiddleware, roleMiddleware(["manager"]), getUsers);
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

router.get(
  "/customers",
  authMiddleware,
  roleMiddleware(["employee", "manager"]),
  getCustomers
);
router.post(
  "/customers",
  authMiddleware,
  roleMiddleware(["manager"]),
  createCustomer
);
router.put(
  "/customers/:employeeId",
  authMiddleware,
  roleMiddleware(["manager"]),
  updateCustomer
);
router.delete(
  "/customers/:employeeId",
  authMiddleware,
  roleMiddleware(["manager"]),
  deleteCustomer
);
// New Branch Routes
router.get(
  "/branches",
  authMiddleware,
  roleMiddleware(["manager"]),
  getBranches
);
router.post(
  "/branches",
  authMiddleware,
  roleMiddleware(["manager"]),
  createBranch
);
router.put(
  "/branches/:branchId",
  authMiddleware,
  roleMiddleware(["manager"]),
  updateBranch
);
router.delete(
  "/branches/:branchId",
  authMiddleware,
  roleMiddleware(["manager"]),
  deleteBranch
);

// Banking Routes
router.post("/deposit", authMiddleware, deposit);
router.post("/withdraw", authMiddleware, withdraw);
router.post("/transfer", authMiddleware, transfer);

// Test Routes
router.get("/test", (req, res) => res.json({ message: "Test works" }));
router.get("/protected-route", authMiddleware, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});

export default router;
