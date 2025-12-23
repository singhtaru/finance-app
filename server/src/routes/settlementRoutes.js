import express from "express";
import { getSettlement } from "../controllers/settlementController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:groupId", protect, getSettlement);

export default router;
