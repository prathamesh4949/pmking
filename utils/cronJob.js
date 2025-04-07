const cron = require("node-cron");
const Expense = require('../models/expense'); 

const moment = require("moment");

// Run the job every night at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Checking for recurring expenses...");

  try {
    const recurringExpenses = await Expense.find({ isRecurring: true });

    for (const expense of recurringExpenses) {
      let nextDate;

      if (expense.recurringInterval === "weekly") {
        nextDate = moment(expense.date).add(1, "week").toDate();
      } else if (expense.recurringInterval === "monthly") {
        nextDate = moment(expense.date).add(1, "month").toDate();
      } else if (expense.recurringInterval === "yearly") {
        nextDate = moment(expense.date).add(1, "year").toDate();
      }

      // Create a new expense entry
      await Expense.create({
        userId: expense.userId,
        category: expense.category,
        amount: expense.amount,
        date: nextDate,
        isRecurring: true,
        recurringInterval: expense.recurringInterval,
      });

      console.log(`✅ Recurring expense created for ${expense.category}`);
    }
  } catch (error) {
    console.error("❌ Error processing recurring expenses:", error);
  }
});

module.exports = cron;
