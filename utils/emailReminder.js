const nodemailer = require("nodemailer");
const Expense = require("../models/expense");
const User = require("../models/user");
const moment = require("moment");

// ✅ Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function emailReminder() {
  console.log("🔔 Checking for upcoming expense reminders...");

  try {
    // Find recurring expenses that are due in the next 3 days
    const upcomingExpenses = await Expense.find({
      isRecurring: true,
      date: { $lte: moment().add(3, "days").toDate() },
    });

    if (upcomingExpenses.length === 0) {
      console.log("✅ No upcoming expenses found.");
      return;
    }

    for (const expense of upcomingExpenses) {
      const user = await User.findById(expense.userId);
      if (!user) continue;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "🔔 Expense Due Reminder",
        text: `Hello ${user.name},\n\nYou have an upcoming ${expense.recurringInterval} expense of ₹${expense.amount} for ${expense.category} on ${moment(expense.date).format("YYYY-MM-DD")}. \n\nStay on top of your finances!\n\n- Expense Tracker Team`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📩 Reminder sent to ${user.email}`);
    }
  } catch (error) {
    console.error("❌ Error sending reminders:", error.message);
  }
}

module.exports = emailReminder;
