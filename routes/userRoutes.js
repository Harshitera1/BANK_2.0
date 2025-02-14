import express from "express";
import {
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "../controllers/userControllers.js";
import { getManagers } from "../controllers/userControllers.js";
import { getTransactions } from "../controllers/userControllers.js";
import { getUsers } from "../controllers/userControllers.js";
import { getCustomers } from "../controllers/userControllers.js";
import { createEmployee } from "../controllers/userControllers.js";

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
export default router;
