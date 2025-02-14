import express from "express";
import { getEmployees } from "../controllers/userControllers.js";
import { getManagers } from "../controllers/userControllers.js";
import { getTransactions } from "../controllers/userControllers.js";
import { getUsers } from "../controllers/userControllers.js";
import { getCustomers } from "../controllers/userControllers.js";

const router = express.Router();

// Route to get all employees
router.get("/employees", getEmployees);
router.get("/managers", getManagers);
router.get("/transactions", getTransactions);
router.get("/users", getUsers);
router.get("/customers", getCustomers);

export default router;
