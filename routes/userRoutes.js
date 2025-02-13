import express from "express";
import { getEmployees } from "../controllers/userControllers.js";
import { getManagers } from "../controllers/userControllers.js";

const router = express.Router();

// Route to get all employees
router.get("/employees", getEmployees);
router.get("/managers", getManagers);

export default router;
