const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: String,
    enum: ["Food", "Travel", "Shopping", "Bills", "Other"],
    required: true,
  },
  limit: { type: Number, required: true },
});

module.exports = mongoose.model("Budget", budgetSchema);
