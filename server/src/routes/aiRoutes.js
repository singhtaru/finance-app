import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getSpendingInsights, getBudgetAnalysis, chatWithAI } from "../controllers/aiController.js";

const router = express.Router();

router.get("/insights", protect, getSpendingInsights);
router.get("/budget", protect, getBudgetAnalysis);
router.post("/chat", protect, chatWithAI);

export default router;
