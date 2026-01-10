import express from "express";
import {
    createGroup,
    joinGroup,
    getMyGroups,
    updateGroup,
    deleteGroup
} from "../controllers/groupController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create group
router.post("/", protect, createGroup);

// Join group
router.post("/join", protect, joinGroup);

// Get my groups
router.get("/", protect, getMyGroups);

// Update group
router.put("/:id", protect, updateGroup);

// Delete group
router.delete("/:id", protect, deleteGroup);

export default router;
