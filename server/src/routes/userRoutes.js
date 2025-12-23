import express from "express";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Get logged-in user
// @route   GET /api/users/me
// @access  Private
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
