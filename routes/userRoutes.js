const express = require("express");
const { getEmployees } = require("../controllers/userController"); // Import controller function

const router = express.Router();

// Route to get all employees
router.get("/employees", getEmployees);

module.exports = router;
