const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Food", "Travel", "Shopping", "Bills", "Other"],
    required: true,
  },
  date: { type: Date, required: true, default: Date.now },
  isRecurring: { type: Boolean, default: false }, // ✅ New field for recurring expenses
  recurringInterval: { type: String, enum: ["weekly", "monthly", "yearly"], default: null }, // ✅ Recurrence interval
});

// ✅ Prevents model overwrite error
const Expense = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

module.exports = Expense;
