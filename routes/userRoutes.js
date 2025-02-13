import express from "express";
import { getEmployees } from "../controllers/userControllers.js";

const router = express.Router();

// Route to get all employees
router.get("/employees", getEmployees);

export default router;
