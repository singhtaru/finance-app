import express from "express";
import {
  addExpense,
  getGroupExpenses,
} from "../controllers/expenseController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Add expense
router.post("/", protect, addExpense);

// Get expenses of a group
router.get("/:groupId", protect, getGroupExpenses);

export default router;
