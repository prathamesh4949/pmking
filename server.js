const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

// Import route files
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const cronJobs = require("./utils/cronJob");
const emailReminder = require("./utils/emailReminder"); // ✅ Import email reminder module

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

console.log(`🌍 CORS allowed for: ${FRONTEND_URL}`);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budget", budgetRoutes);

// ✅ API route for triggering email reminders manually
app.get("/api/send-email-reminder", async (req, res) => {
  try {
    await emailReminder(); // Call the email reminder function
    res.json({ success: true, message: "Email reminders sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email reminders:", error.message);
    res.status(500).json({ error: "Failed to send email reminders" });
  }
});

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.json({ message: "🚀 Server is running!" });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
