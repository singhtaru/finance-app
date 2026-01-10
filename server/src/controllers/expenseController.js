import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import axios from "axios";

// @desc    Add expense to group
// @route   POST /api/expenses
// @access  Private
export const addExpense = async (req, res) => {
  try {
    const { description, amount, groupId, splitBetween, splitType, category, currency } = req.body;

    // 1. Basic validation
    if (!description || !amount) {
      return res.status(400).json({ message: "Description and amount are required" });
    }

    // 2. Check group exists (IF groupId provided)
    let group = null;
    let baseCurrency = "INR"; // Default for personal expenses

    if (groupId) {
      group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      // 3. Ensure user is part of the group
      if (!group.members.includes(req.user._id)) {
        return res.status(403).json({ message: "Not a group member" });
      }
      baseCurrency = group.baseCurrency;
    }

    // 3.5 Handle Currency Conversion
    let finalAmount = amount;
    let exchangeRate = 1;

    if (currency && currency !== baseCurrency) {
      try {
        // Fetch exchange rate
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        const rates = response.data.rates;
        exchangeRate = rates[baseCurrency];

        if (exchangeRate) {
          finalAmount = amount * exchangeRate;
        }
      } catch (error) {
        console.error("Currency API Error:", error);
      }
    }

    // 4. Calculate Splits
    let finalSplit = [];

    if (group) {
      // GROUP EXPENSE LOGIC
      if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
        return res.status(400).json({ message: "splitBetween must be a non-empty array for group expenses" });
      }

      if (typeof splitBetween[0] === 'string') {
        // Array of User IDs (Strings) - convert to objects
        const share = finalAmount / splitBetween.length;
        finalSplit = splitBetween.map(userId => ({
          user: userId,
          amount: share,
          paidStatus: false
        }));
      } else if (typeof splitBetween[0] === 'object' && splitBetween[0] !== null) {
        // Array of Objects - validate and normalize
        const isValid = splitBetween.every(item =>
          item &&
          typeof item === 'object' &&
          (item.user || item.userId) &&
          typeof item.amount === 'number'
        );

        if (!isValid) {
          return res.status(400).json({
            message: "Invalid split data: objects must have 'user' and 'amount' fields"
          });
        }

        finalSplit = splitBetween.map(item => ({
          user: item.user || item.userId,
          amount: item.amount,
          paidStatus: item.paidStatus || false
        }));
      } else {
        return res.status(400).json({
          message: "Invalid split data: expected array of user ID strings or objects"
        });
      }
    } else {
      // PERSONAL EXPENSE LOGIC -> 100% to User
      finalSplit = [{
        user: req.user._id,
        amount: finalAmount,
        paidStatus: true // Assumed paid by self for self
      }];
    }

    // 5. Create expense
    const expense = await Expense.create({
      description,
      amount: finalAmount, // Store converted amount
      originalAmount: amount, // Store original input amount
      currency: currency || baseCurrency,
      exchangeRate,
      paidBy: req.user._id,
      splitBetween: finalSplit,
      group: groupId || undefined, // Optional group
      splitType: splitType || "EQUAL",
      category: category || "Other"
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
      .populate("splitBetween.user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("GET EXPENSES ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, splitBetween, splitType, category } = req.body;

    // 1. Find expense
    console.log("UPDATE BODY:", JSON.stringify(req.body, null, 2));
    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // 2. CHECK OWNERSHIP (Security update)
    if (!expense.paidBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to edit this expense" });
    }

    // 3. Update fields
    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.splitType = splitType || expense.splitType;
    expense.category = category || expense.category;

    // Recalculate splits if splitBetween is updated
    if (splitBetween !== undefined) {
      // Ensure splitBetween is an array
      if (!Array.isArray(splitBetween)) {
        return res.status(400).json({ message: "splitBetween must be an array" });
      }

      // Handle empty array
      if (splitBetween.length === 0) {
        return res.status(400).json({ message: "splitBetween cannot be empty" });
      }

      // Check the first item to determine structure
      const isStringArray = typeof splitBetween[0] === 'string';

      if (isStringArray) {
        // Case 1: Array of User IDs (Strings) - convert to objects
        const share = (amount || expense.amount) / splitBetween.length;
        expense.splitBetween = splitBetween.map(userId => ({
          user: userId,
          amount: share,
          paidStatus: false
        }));
      } else if (typeof splitBetween[0] === 'object' && splitBetween[0] !== null) {
        // Case 2: Array of Objects - validate structure
        const isValid = splitBetween.every(item =>
          item &&
          typeof item === 'object' &&
          (item.user || item.userId) &&
          typeof item.amount === 'number'
        );

        if (!isValid) {
          return res.status(400).json({
            message: "Invalid split data: objects must have 'user' and 'amount' fields"
          });
        }

        // Normalize the objects to ensure they have the correct structure
        expense.splitBetween = splitBetween.map(item => ({
          user: item.user || item.userId,
          amount: item.amount,
          paidStatus: item.paidStatus || false
        }));
      } else {
        return res.status(400).json({
          message: "Invalid split data: expected array of user ID strings or objects"
        });
      }
    } else if (amount) {
      const currentCount = expense.splitBetween.length;
      if (currentCount > 0) {
        const share = amount / currentCount;
        expense.splitBetween.forEach(s => s.amount = share);
      }
    }

    const updatedExpense = await expense.save();

    res.status(200).json({
      message: "Expense updated successfully",
      updatedExpense,
    });
  } catch (error) {
    console.error("UPDATE EXPENSE ERROR 👉", error);

    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get expense analytics
// @route   GET /api/expenses/:groupId/analytics
// @access  Private
export const getExpenseAnalytics = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId }).populate("paidBy", "name");

    if (!expenses.length) {
      return res.status(200).json({
        total: 0,
        categoryBreakdown: {},
        topSpender: null
      });
    }

    // 1. Total Spending
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 2. Category Breakdown
    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    // 3. Top Spender
    const spenderStats = expenses.reduce((acc, exp) => {
      const name = exp.paidBy.name;
      acc[name] = (acc[name] || 0) + exp.amount;
      return acc;
    }, {});

    let topSpender = null;
    let maxSpend = -1;

    Object.entries(spenderStats).forEach(([name, amount]) => {
      if (amount > maxSpend) {
        maxSpend = amount;
        topSpender = { name, amount };
      }
    });

    // 4. Monthly Breakdown
    const monthlyBreakdown = expenses.reduce((acc, exp) => {
      const month = new Date(exp.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + exp.amount;
      return acc;
    }, {});

    res.json({
      total,
      categoryBreakdown,
      topSpender,
      monthlyBreakdown
    });

  } catch (error) {
    console.error("ANALYTICS ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get personal expenses
// @route   GET /api/expenses/personal
// @access  Private
export const getPersonalExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      group: { $exists: false },
      paidBy: req.user._id
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    console.error("GET PERSONAL EXPENSES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch personal expenses" });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // CHECK OWNERSHIP
    if (!expense.paidBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete this expense" });
    }

    await expense.deleteOne();

    res.status(200).json({ message: "Expense deleted successfully", id });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};
