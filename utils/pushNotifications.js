const webpush = require("web-push");
const Expense = require('../models/expense'); 
const moment = require("moment");

// Configure Web Push API
webpush.setVapidDetails(
  "mailto:your-email@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Function to send push notifications
const sendPushNotification = async () => {
  try {
    const upcomingExpenses = await Expense.find({
      isRecurring: true,
      date: { $lte: moment().add(3, "days").toDate() }, // Notify 3 days before
    });

    upcomingExpenses.forEach((expense) => {
      const payload = JSON.stringify({
        title: "🔔 Expense Reminder",
        message: `Your expense of ₹${expense.amount} for ${expense.category} is due soon.`,
      });

      webpush.sendNotification(subscription, payload).catch((err) => console.error(err));
    });

    console.log("📲 Push notifications sent");
  } catch (error) {
    console.error("❌ Error sending push notifications:", error);
  }
};

// Run the function daily at 9 AM
const cron = require("node-cron");
cron.schedule("0 9 * * *", sendPushNotification);

module.exports = sendPushNotification;
