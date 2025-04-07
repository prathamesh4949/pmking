const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Expense = require("../models/expense");
const Budget = require("../models/Budget"); // Ensure this model exists
const authMiddleware = require("../middleware/authMiddleware");

// ✅ POST Route to add an expense
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { amount, category, date } = req.body;

        if (!amount || !category || !date) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newExpense = new Expense({
            userId: req.user.id,
            amount,
            category,
            date,
        });

        await newExpense.save();
        res.status(201).json({ message: "Expense added successfully", expense: newExpense });
    } catch (error) {
        console.error("❌ Error adding expense:", error);
        res.status(500).json({ message: "Server error while adding expense." });
    }
});

// ✅ GET Route to fetch all expenses for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });

        if (!expenses.length) {
            return res.status(404).json({ message: "No expenses found." });
        }

        res.json(expenses);
    } catch (error) {
        console.error("❌ Error fetching expenses:", error);
        res.status(500).json({ message: "Server error while fetching expenses." });
    }
});

// ✅ GET Route to fetch budget warnings
router.get("/budget-warnings", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const budgets = await Budget.find({ userId });
        const expenses = await Expense.find({ userId });

        if (!budgets.length) {
            return res.status(404).json({ message: "No budgets found." });
        }

        let warnings = [];
        budgets.forEach((budget) => {
            const totalSpent = expenses
                .filter((exp) => exp.category === budget.category)
                .reduce((sum, exp) => sum + exp.amount, 0);

            if (totalSpent >= budget.limit * 0.8) {
                warnings.push(`⚠️ You have reached 80% of your budget for ${budget.category}`);
            }

            if (totalSpent > budget.limit) {
                warnings.push(`🚨 You have exceeded your budget for ${budget.category}`);
            }
        });

        res.json({ warnings });
    } catch (error) {
        console.error("❌ Error fetching budget warnings:", error);
        res.status(500).json({ message: "Server error while fetching budget warnings." });
    }
});

// ✅ GET Route to fetch monthly expense trends (🔥 FIXED)
router.get("/monthly-trends", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("📊 Fetching monthly trends for user:", userId);

    const monthlyTrends = await Expense.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    console.log("📊 MongoDB Aggregate Result:", monthlyTrends);

    if (!monthlyTrends.length) {
      return res.status(404).json({ message: "No expense data found." });
    }

    res.json(monthlyTrends);
  } catch (error) {
    console.error("❌ Error fetching monthly trends:", error);
    res.status(500).json({ error: "Server error while fetching trends." });
  }
});

module.exports = router;
