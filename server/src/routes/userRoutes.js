import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getUserStats, updateUserBudget } from "../controllers/userController.js";

const router = express.Router();

// @desc    Get logged-in user
// @route   GET /api/users/me
// @access  Private
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
router.get("/stats", protect, getUserStats);

// @desc    Update user budget
// @route   PUT /api/users/budget
// @access  Private
router.put("/budget", protect, updateUserBudget);

export default router;
