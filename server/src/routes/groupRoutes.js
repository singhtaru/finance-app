import express from "express";
import { createGroup, joinGroup, getMyGroups } from "../controllers/groupController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create group
router.post("/", protect, createGroup);

// Join group
router.post("/join", protect, joinGroup);

// Get my groups
router.get("/", protect, getMyGroups);
export default router;
