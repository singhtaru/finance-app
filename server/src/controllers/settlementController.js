import Expense from "../models/Expense.js";

// @desc    Get settlement for a group
// @route   GET /api/settlements/:groupId
// @access  Private
export const getSettlement = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name")
      .populate("splitBetween", "name");

    const balance = {};

    expenses.forEach((expense) => {
      const splitAmount = expense.amount / expense.splitBetween.length;

      // Everyone owes their share
      expense.splitBetween.forEach((user) => {
        if (!balance[user.name]) balance[user.name] = 0;
        balance[user.name] -= splitAmount;
      });

      // Payer gets full amount
      if (!balance[expense.paidBy.name]) {
        balance[expense.paidBy.name] = 0;
      }
      balance[expense.paidBy.name] += expense.amount;
    });

    res.json(balance);
  } catch (error) {
    console.error("SETTLEMENT ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};
