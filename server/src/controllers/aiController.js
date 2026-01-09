import Expense from "../models/Expense.js";
import User from "../models/User.js";
import * as aiService from "../services/aiService.js";

// @desc    Get Spending Insights
// @route   GET /api/ai/insights
// @access  Private
export const getSpendingInsights = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch expenses for the user (where they are part of the split)
        const expenses = await Expense.find({
            "splitBetween.user": userId
        }).populate("group", "name");

        if (expenses.length === 0) {
            return res.status(200).json(["No expenses found to analyze."]);
        }

        // Process data for AI (anonymized/structured)
        const spendingData = expenses.map(e => ({
            amount: `${e.currency || 'INR'} ${e.splitBetween.find(s => s.user.toString() === userId.toString())?.amount || 0}`,
            category: e.category,
            date: e.createdAt,
            group: e.group?.name
        }));

        const insights = await aiService.generateInsights(spendingData);
        res.json(insights);
    } catch (error) {
        console.error("AI Insights Error:", error);
        res.status(500).json({ message: "Failed to generate insights" });
    }
};

// @desc    Get Budget Analysis
// @route   GET /api/ai/budget
// @access  Private
export const getBudgetAnalysis = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        const budget = user.monthlyBudget || 0;

        // Calculate current month's spend
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const expenses = await Expense.find({
            "splitBetween.user": userId
        });

        let totalSpent = 0;
        const categoryBreakdown = {};

        expenses.forEach(e => {
            const share = e.splitBetween.find(s => s.user.toString() === userId.toString())?.amount || 0;
            totalSpent += share;
            categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + share;
        });

        if (budget === 0) {
            return res.status(200).json({
                budget: 0,
                totalSpent,
                analysis: "Please set a monthly budget to get analysis.",
                tips: ["Go to profile to set a budget."]
            });
        }

        // Identify primary currency from expenses (default INR)
        const currencies = {};
        expenses.forEach(e => {
            const c = e.currency || "INR";
            currencies[c] = (currencies[c] || 0) + 1;
        });
        const primaryCurrency = Object.keys(currencies).sort((a, b) => currencies[b] - currencies[a])[0] || "INR";

        const advice = await aiService.generateBudgetAdvice(budget, totalSpent, categoryBreakdown, primaryCurrency);

        res.json({
            budget,
            totalSpent,
            ...advice
        });

    } catch (error) {
        console.error("AI Budget Analysis Error:", error);
        res.status(500).json({ message: "Failed to analyze budget" });
    }
};
// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        // Fetch recent expenses for context (last 30 days)
        const startDates = new Date();
        startDates.setDate(startDates.getDate() - 30);

        const expenses = await Expense.find({
            "splitBetween.user": userId,
            createdAt: { $gte: startDates }
        }).populate("group", "name");

        // Simplify data for token efficiency
        const contextData = expenses.map(e => ({
            desc: e.description,
            amount: `${e.currency || 'INR'} ${e.splitBetween.find(s => s.user.toString() === userId.toString())?.amount || 0}`,
            cat: e.category,
            date: e.createdAt.toISOString().split('T')[0]
        }));

        const result = await aiService.chatWithUser(message, contextData);
        res.json(result);

    } catch (error) {
        console.error("AI Chat Controller Error:", error);
        res.status(500).json({ message: "Failed to chat with AI" });
    }
};
