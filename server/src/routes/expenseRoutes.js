import express from "express";
import {
  addExpense,
  getGroupExpenses,
  updateExpense,
  getExpenseAnalytics,
  getPersonalExpenses,
  deleteExpense
} from "../controllers/expenseController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Add expense
router.post("/", protect, addExpense);

// Get personal expenses
router.get("/personal", protect, getPersonalExpenses);

// Get expenses of a group
router.get("/:groupId", protect, getGroupExpenses);

// Update expense
router.put("/:id", protect, updateExpense);

// Delete expense
router.delete("/:id", protect, deleteExpense);

// Get expense analytics
router.get("/:groupId/analytics", protect, getExpenseAnalytics);

export default router;
