const express = require("express");
const Budget = require("../models/Budget");
const Expense = require("../models/expense");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

// ✅ Set Budget (Protected Route)
router.post("/set", authMiddleware, async (req, res) => {
  const { category, limit } = req.body;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    let budget = await Budget.findOne({ userId, category });

    if (budget) {
      budget.limit = limit;
    } else {
      budget = new Budget({ userId, category, limit });
    }

    await budget.save();
    res.json({ message: "Budget set successfully", budget });
  } catch (err) {
    console.error("Error setting budget:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get Budget (Protected Route)
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const budgets = await Budget.find({ userId });
    res.json(budgets);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Check Budget Limits (Protected Route)
router.get("/check-budget", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const budgets = await Budget.find({ userId });
    const expenses = await Expense.find({ userId });

    let warnings = [];
    budgets.forEach((budget) => {
      const totalSpent = expenses
        .filter((exp) => exp.category === budget.category)
        .reduce((sum, exp) => sum + exp.amount, 0);

      console.log(`Category: ${budget.category}, Spent: ${totalSpent}, Limit: ${budget.limit}`); // ✅ Debugging log

      if (totalSpent >= budget.limit * 0.8 && totalSpent < budget.limit) {
        warnings.push(`⚠️ You have reached 80% of your budget for ${budget.category}`);
      }
      if (totalSpent >= budget.limit) {
        warnings.push(`🚨 You have exceeded your budget for ${budget.category}`);
      }
    });

    console.log("Warnings:", warnings); // ✅ Debugging log
    res.json({ warnings });
  } catch (err) {
    console.error("Error checking budget:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
