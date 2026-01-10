import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

import passport from "passport";
import { generateToken } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get("/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(500).json({
            message: "Google Auth credentials missing in server/.env. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        });
    }
    passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const token = generateToken(req.user._id);
        // Redirect to client with token
        res.redirect(`http://localhost:5173?token=${token}`);
    }
);

export default router;
