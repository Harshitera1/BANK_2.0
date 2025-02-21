import express from "express";
import { createManager } from "../controllers/userControllers.js";
import { deleteEmployee } from "../controllers/userControllers.js";
import { deleteManager } from "../controllers/userControllers.js";
import { getEmployees } from "../controllers/userControllers.js";
import { updateEmployee } from "../controllers/userControllers.js";
import { updateManager } from "../controllers/userControllers.js";
import { getManagers } from "../controllers/userControllers.js";
import { getTransactions } from "../controllers/userControllers.js";
import { getUsers } from "../controllers/userControllers.js";
import { getCustomers } from "../controllers/userControllers.js";
import { createEmployee } from "../controllers/userControllers.js";
import { createTransaction } from "../controllers/userControllers.js";
import { deleteTransaction } from "../controllers/userControllers.js";
import { updateTransaction } from "../controllers/userControllers.js";
import { updateUser } from "../controllers/userControllers.js";
import { createUser } from "../controllers/userControllers.js";
import { deleteUser } from "../controllers/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { registerUser, loginUser } from "../controllers/userControllers.js";
// import { verifyToken } from "../utils/jwt.js";

const router = express.Router();

// Route to get all employees
router.get("/employees", getEmployees);
router.get("/managers", getManagers);
router.get("/transactions", getTransactions);
router.get("/users", getUsers);
router.get("/customers", getCustomers);
router.post("/employees", createEmployee);
router.put("/employees/:employeeId", updateEmployee); // Use employeeId instead of _id
router.delete("/employees/:employeeId", deleteEmployee);
router.post("/managers", createManager);
router.put("/managers/:managerId", updateManager); // Use managerId instead of _id
router.delete("/managers/:managerId", deleteManager);
router.post("/transactions", createTransaction);
router.put("/transactions/:transactionId", updateTransaction);
router.delete("/transactions/:transactionId", deleteTransaction);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
//grok
// routes/userRoutes.js
router.get("/employees", authMiddleware, getEmployees);
router.get("/managers", authMiddleware, getManagers);
router.get("/transactions", authMiddleware, getTransactions);
router.get("/users", authMiddleware, getUsers);
router.get("/customers", authMiddleware, getCustomers);
// Keep register and login public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/test", (req, res) => res.json({ message: "Test works" }));
// Protected Route Example
router.get("/protected-route", authMiddleware, (req, res) => {
  res.json({ message: "Access granted!", user: req.user });
});
export default router;
