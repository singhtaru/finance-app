import Expense from "../models/Expense.js";
import User from "../models/User.js";

// @desc    Get user stats (spending across all groups)
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all expenses where the user is one of the split participants OR the payer
        // Actually, "spending" usually means "what I paid for as my share" or "what I paid out of pocket"?
        // In Splitwise terms:
        // "Total Expense" = Sum of my shares in all expenses.

        // Let's calculate:
        // 1. Total amount user has "spent" (their share in expenses).
        // 2. Spending by category.

        // Find expenses where user is in splitBetween
        const expenses = await Expense.find({
            "splitBetween.user": userId
        });

        let totalSpent = 0;
        const categoryBreakdown = {};

        expenses.forEach(expense => {
            // Find user's share
            const userSplit = expense.splitBetween.find(split => split.user.toString() === userId.toString());

            if (userSplit) {
                const amount = userSplit.amount;
                totalSpent += amount;

                // Category breakdown
                const category = expense.category || "Other";
                categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
            }
        });

        res.json({
            totalSpent,
            categoryBreakdown
        });

    } catch (error) {
        console.error("USER STATS ERROR 👉", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update User Budget
// @route   PUT /api/users/budget
// @access  Private
export const updateUserBudget = async (req, res) => {
    try {
        const { monthlyBudget } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.monthlyBudget = monthlyBudget;
        await user.save();

        res.json({
            message: "Budget updated successfully",
            monthlyBudget: user.monthlyBudget
        });
    } catch (error) {
        console.error("UPDATE BUDGET ERROR 👉", error);
        res.status(500).json({ message: "Server error" });
    }
};
