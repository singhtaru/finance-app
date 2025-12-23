import Expense from "../models/Expense.js";
import Group from "../models/Group.js";

// @desc    Add expense to group
// @route   POST /api/expenses
// @access  Private
export const addExpense = async (req, res) => {
  try {
    const { description, amount, groupId, splitBetween } = req.body;

    // 1. Basic validation
    if (!description || !amount || !groupId || !splitBetween) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 3. Ensure user is part of the group
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not a group member" });
    }

    // 4. Create expense
    const expense = await Expense.create({
      description,
      amount,
      paidBy: req.user._id,
      splitBetween,
      group: groupId,
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error("ADD EXPENSE ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Get expenses of a group
// @route   GET /api/expenses/:groupId
// @access  Private
export const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;

    // 1. Fetch expenses of this group
    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("GET EXPENSES ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};
