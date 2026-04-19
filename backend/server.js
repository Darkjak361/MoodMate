// MoodMate Industrial Backend Server - 1,000,000% Professional Edition!
// Architecture: MVC (Models-Routes-Controllers) 🛡️⚓️🚀
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// --- 🛡️ INDUSTRIAL MODULES ---
const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const inspirationsData = require("./data/inspirations.json");
const activitiesData = require("./data/activities.json");
const Settings = require("./models/Settings");
const { scheduleNotificationForUser } = require("./services/notificationService");
const authenticateToken = require("./middleware/auth");
const authController = require("./controllers/authController");

const app = express();

// --- 🛡️ STARTUP SYNCHRONIZATION ---
const initializeIndustrialServices = async () => {
  try {
    console.log("🔄 [Startup] Synchronizing Industrial Services...");
    const allSettings = await Settings.find({ 
      dailyReminders: true, 
      pushToken: { $exists: true, $ne: null } 
    });
    
    console.log(`📡 [Startup] Found ${allSettings.length} active notification profiles.`);
    for (const settings of allSettings) {
      try {
        await scheduleNotificationForUser(settings.userId, settings);
      } catch (err) {
        console.error(`⚠️ [Startup] Failed to sync notifications for user ${settings.userId}:`, err.message);
      }
    }
    console.log("✅ [Startup] Synchronization Complete!");
  } catch (error) {
    console.error("❌ [Startup] Initialization Error:", error);
  }
};

// --- 🛡️ MIDDLEWARE SHIELD ---
app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "bypass-tunnel-reminder", "ngrok-skip-browser-warning", "lhr-skip-browser-warning"],
}));

// --- 🛡️ DATABASE SYNC ---
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/moodmate")
  .then(() => {
    console.log("✅ Industrial Database: CONNECTED");
    initializeIndustrialServices();
  })
  .catch((err) => console.error("❌ Database Error:", err));

// --- 🛡️ PROCESS GUARDIANS ---
process.on('uncaughtException', (err) => {
  console.error('💥 [CRITICAL] Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 [CRITICAL] Unhandled Rejection:', reason);
});

// --- 🛡️ ROUTE REGISTRATION ---
app.use("/api/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/settings", settingsRoutes);
app.delete("/api/user", authenticateToken, authController.deleteAccount);

// --- 🛡️ CORE API ENDPOINTS ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Industrial Server is LIVE" });
});

app.get("/api/quotes/daily", async (req, res) => {
  try {
    const randomQuote = inspirationsData[Math.floor(Math.random() * inspirationsData.length)];
    res.json({ text: randomQuote.q, author: randomQuote.a });
  } catch (error) {
    res.json({ text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" });
  }
});

app.get("/api/activities/daily", async (req, res) => {
  try {
    const randomActivity = activitiesData[Math.floor(Math.random() * activitiesData.length)];
    res.json(randomActivity);
  } catch (error) {
    res.json({ text: "Take a deep breath and smile.", type: "mindful", icon: "happy" });
  }
});

// --- 🚀 LAUNCH PAD ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Industrial Server running on port ${PORT}`);
  console.log(`📱 1,000,000% Professional Capstone Submission Ready!`);
});
