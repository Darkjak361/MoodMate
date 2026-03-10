const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  dailyReminders: { type: Boolean, default: false },
  notificationHour: { type: Number, default: 9 },
  notificationMinute: { type: Number, default: 0 },
  pushToken: { type: String },
  theme: { type: String, default: "light" },
  updatedAt: { type: Date, default: Date.now }
});

const MoodEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  mood: { type: String, required: true },
  score: { type: Number, required: true },
  emojiMood: String,
  energyLevel: Number,
  activities: [String],
  gratitude: String,
  moodInsight: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Settings = mongoose.model("Settings", SettingsSchema);
const MoodEntry = mongoose.model("MoodEntry", MoodEntrySchema);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token." });
  }
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: username || email.split("@")[0],
      email,
      password: hashedPassword,
      name
    });

    await user.save();

    const settings = new Settings({
      userId: user._id.toString(),
      dailyReminders: false,
      theme: "light"
    });
    await settings.save();

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({ error: "Email, name, and googleId are required" });
    }

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      user = new User({
        email,
        name,
        googleId,
        username: email.split("@")[0]
      });
      await user.save();

      const settings = new Settings({
        userId: user._id.toString(),
        dailyReminders: false,
        notificationHour: 9,
        notificationMinute: 0,
        theme: "light"
      });
      await settings.save();
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/settings", authenticateToken, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = new Settings({
        userId: req.user.userId,
        dailyReminders: false,
        notificationHour: 9,
        notificationMinute: 0,
        theme: "light"
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/push/register", authenticateToken, async (req, res) => {
  try {
    const { pushToken } = req.body;
    const userId = req.user.userId;

    if (!pushToken) {
      return res.status(400).json({ error: "Push token is required" });
    }

    let settings = await Settings.findOne({ userId });
    if (!settings) {
      settings = new Settings({ userId, pushToken });
    } else {
      settings.pushToken = pushToken;
    }
    await settings.save();

    res.json({ message: "Push token registered successfully" });
  } catch (error) {
    console.error("Push token registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/push/send", authenticateToken, async (req, res) => {
  try {
    const { title, body, data } = req.body;
    const userId = req.user.userId;

    const settings = await Settings.findOne({ userId });
    if (!settings || !settings.pushToken) {
      return res.status(400).json({ error: "Push token not registered" });
    }

    const message = {
      to: settings.pushToken,
      sound: "default",
      title: title || "MoodMate Reminder",
      body: body || "Time to check in with your mood! How are you feeling today?",
      data: data || {},
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    res.json({ success: true, result });
  } catch (error) {
    console.error("Push notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function analyzeMood(text) {
  try {
    const lowerText = text.toLowerCase();
    const positiveWords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'good', 'fantastic', 'excellent', 'awesome', 'glad', 'pleased', 'delighted', 'cheerful', 'content', 'grateful', 'blessed', 'lucky', 'smile', 'laugh'];
    const negativeWords = ['sad', 'angry', 'mad', 'frustrated', 'anxious', 'worried', 'stressed', 'depressed', 'upset', 'disappointed', 'hurt', 'lonely', 'tired', 'exhausted', 'hate', 'terrible', 'awful', 'horrible', 'bad', 'cry', 'fear'];
    
    const hasPositive = positiveWords.some(word => lowerText.includes(word));
    const hasNegative = negativeWords.some(word => lowerText.includes(word));
    
    if (hasPositive && !hasNegative) {
      return { mood: "POSITIVE", score: 0.8 };
    }
    if (hasNegative && !hasPositive) {
      return { mood: "NEGATIVE", score: 0.8 };
    }

    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      console.error("Hugging Face API HTTP Error:", response.status);
      if (hasPositive) return { mood: "POSITIVE", score: 0.7 };
      if (hasNegative) return { mood: "NEGATIVE", score: 0.7 };
      return { mood: "NEUTRAL", score: 0.5 };
    }

    const result = await response.json();

    if (result.error) {
      console.error("Hugging Face API Error:", result.error);
      if (hasPositive) return { mood: "POSITIVE", score: 0.7 };
      if (hasNegative) return { mood: "NEGATIVE", score: 0.7 };
      return { mood: "NEUTRAL", score: 0.5 };
    }

    let scores;
    if (Array.isArray(result) && result[0]) {
      scores = Array.isArray(result[0]) ? result[0] : result;
    } else if (result[0]) {
      scores = result[0];
    } else {
      scores = result;
    }

    if (!Array.isArray(scores)) {
      console.error("Unexpected API response format:", result);
      if (hasPositive) return { mood: "POSITIVE", score: 0.7 };
      if (hasNegative) return { mood: "NEGATIVE", score: 0.7 };
      return { mood: "NEUTRAL", score: 0.5 };
    }

    const maxLabel = scores.reduce((a, b) => (a.score > b.score ? a : b));

    const labelMap = {
      LABEL_0: "NEGATIVE",
      LABEL_1: "NEUTRAL",
      LABEL_2: "POSITIVE",
      negative: "NEGATIVE",
      neutral: "NEUTRAL",
      positive: "POSITIVE",
    };

    const mood = labelMap[maxLabel.label] || "NEUTRAL";
    const score = maxLabel.score || 0.5;

    return { mood, score };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    const lowerText = text.toLowerCase();
    const positiveWords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'good'];
    const negativeWords = ['sad', 'angry', 'mad', 'frustrated', 'anxious', 'worried', 'stressed', 'depressed'];
    const hasPositive = positiveWords.some(word => lowerText.includes(word));
    const hasNegative = negativeWords.some(word => lowerText.includes(word));
    
    if (hasPositive) return { mood: "POSITIVE", score: 0.7 };
    if (hasNegative) return { mood: "NEGATIVE", score: 0.7 };
    return { mood: "NEUTRAL", score: 0.5 };
  }
}

app.post("/api/mood/analyze", authenticateToken, async (req, res) => {
  try {
    const { text, emojiMood, energyLevel, activities, gratitude } = req.body;
    const userId = req.user.userId;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const emojiMoodMap = {
      happy: "POSITIVE",
      sad: "NEGATIVE",
      angry: "NEGATIVE",
      anxious: "NEGATIVE",
      neutral: "NEUTRAL"
    };

    const getMoodInsight = (mood) => {
      const insights = {
        POSITIVE: [
          "You're doing great today. Take a moment to appreciate this feeling.",
          "Your positive energy is shining through! Keep up the great work.",
          "It's wonderful to see you feeling good. Savor this moment!",
          "You're radiating positivity today. Let it guide your day!",
          "Your good mood is contagious! Spread that joy around.",
          "Feeling positive? That's amazing! Remember this feeling for later.",
        ],
        NEUTRAL: [
          "You're steady today. A small walk or stretch might brighten your mood.",
          "Feeling balanced? That's perfectly okay. Sometimes neutral is just right.",
          "You're in a calm state. Consider trying something new to add some sparkle.",
          "Steady as you go! A little movement or music might lift your spirits.",
          "You're feeling neutral today. That's a good foundation to build on.",
          "Balance is beautiful. If you want a boost, try a quick activity you enjoy.",
        ],
        NEGATIVE: [
          "It's okay to have off days. Try taking a slow breath and grounding yourself.",
          "Tough feelings are valid. Remember, this too shall pass.",
          "You're going through a rough patch, and that's okay. Be gentle with yourself.",
          "Difficult emotions are part of being human. You're not alone in this.",
          "It's okay to not be okay. Take your time and be kind to yourself.",
          "Rough days happen. Try some deep breathing or reach out to someone you trust.",
        ],
      };
      const moodInsights = insights[mood] || insights.NEUTRAL;
      const timestamp = Date.now();
      const random = Math.random();
      const combinedSeed = (timestamp % 1000000) + (random * 1000);
      const randomIndex = Math.floor(combinedSeed % moodInsights.length);
      const selectedInsight = moodInsights[randomIndex];
      console.log(`Generated ${mood} insight (index ${randomIndex}/${moodInsights.length}) at ${timestamp}: "${selectedInsight}"`);
      return selectedInsight;
    };

    let sentiment;
    
    if (emojiMood && emojiMoodMap[emojiMood.toLowerCase()]) {
      const mood = emojiMoodMap[emojiMood.toLowerCase()];
      const textSentiment = await analyzeMood(text);
      let score = textSentiment.score;
      if (!score || score < 0.5) {
        score = mood === "NEUTRAL" ? 0.5 : 0.75;
      }
      sentiment = {
        mood: mood,
        score: score
      };
    } else {
      sentiment = await analyzeMood(text);
    }

    const moodInsight = getMoodInsight(sentiment.mood);

    const newEntry = new MoodEntry({
      userId,
      text,
      mood: sentiment.mood,
      score: sentiment.score,
      emojiMood,
      energyLevel,
      activities,
      gratitude,
      moodInsight
    });

    await newEntry.save();

    res.json({
      message: "Mood analyzed successfully",
      result: sentiment,
      entry: newEntry
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/mood/history", authenticateToken, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(entries);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/mood/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`🗑️  Attempting to delete all mood entries for user: ${userId}`);
    console.log(`📋 User ID type: ${typeof userId}, value: ${userId}`);
    
    const countBefore = await MoodEntry.countDocuments({ userId: userId });
    console.log(`📊 Found ${countBefore} mood entries for user ${userId}`);
    
    const allEntries = await MoodEntry.find({}).limit(5);
    if (allEntries.length > 0) {
      console.log(`📋 Sample entry userId format: ${typeof allEntries[0].userId}, value: ${allEntries[0].userId}`);
    }
    
    const result = await MoodEntry.deleteMany({ userId: userId });
    console.log(`✅ Deleted ${result.deletedCount} mood entries for user ${userId}`);
    
    const countAfter = await MoodEntry.countDocuments({ userId: userId });
    console.log(`📊 Remaining entries after deletion: ${countAfter}`);
    
    if (countAfter > 0) {
      console.warn(`⚠️  Warning: ${countAfter} entries still exist after deletion attempt`);
      const remainingEntries = await MoodEntry.find({ userId: userId }).limit(3);
      console.log(`📋 Remaining entry userIds:`, remainingEntries.map(e => ({ id: e._id, userId: e.userId })));
    }
    
    res.json({ 
      message: "All mood data deleted", 
      deletedCount: result.deletedCount,
      countBefore,
      countAfter
    });
  } catch (error) {
    console.error("❌ Clear history error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

app.delete("/api/mood/:id", authenticateToken, async (req, res) => {
  try {
    const entry = await MoodEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }
    if (entry.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await MoodEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Attempting to delete user:", userId);
    
    const moodResult = await MoodEntry.deleteMany({ userId });
    console.log(`Deleted ${moodResult.deletedCount} mood entries`);
    
    const settingsResult = await Settings.deleteOne({ userId });
    console.log(`Deleted ${settingsResult.deletedCount} settings`);
    
    let userResult;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userResult = await User.findByIdAndDelete(userId);
    } else {
      userResult = await User.findOneAndDelete({ 
        $or: [
          { _id: userId },
          { email: req.user.email }
        ]
      });
    }
    
    if (!userResult) {
      console.error("User not found for deletion:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`User ${userId} and all associated data deleted successfully`);
    res.json({ message: "User account and all data deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

app.get("/api/mood/stats", authenticateToken, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.user.userId });
    
    const stats = {
      total: entries.length,
      positive: entries.filter(e => e.mood === "POSITIVE").length,
      neutral: entries.filter(e => e.mood === "NEUTRAL").length,
      negative: entries.filter(e => e.mood === "NEGATIVE").length,
      averageEnergy:
        entries.length > 0
          ? entries.reduce((sum, e) => sum + (e.energyLevel || 0), 0) / entries.length
          : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    const message = {
      to: pushToken,
      sound: "default",
      title: title || "MoodMate Reminder",
      body: body || "Time to check in with your mood! How are you feeling today?",
      data: data || {},
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Push notification error:", error);
    return null;
  }
};

const notificationTimers = new Map();

const getTimeUntilNextNotification = (hour, minute) => {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  target.setSeconds(0, 0);
  target.setMilliseconds(0);
  
  const msUntil = target.getTime() - now.getTime();
  if (target <= now || msUntil < 600000) {
    target.setDate(target.getDate() + 1);
  }
  
  const finalMsUntil = target.getTime() - new Date().getTime();
  
  return Math.max(finalMsUntil, 600000);
};

const scheduleNotificationForUser = async (userId, settings) => {
  if (!settings.dailyReminders || !settings.pushToken) {
    if (notificationTimers.has(userId)) {
      clearTimeout(notificationTimers.get(userId));
      notificationTimers.delete(userId);
    }
    return;
  }

  if (notificationTimers.has(userId)) {
    clearTimeout(notificationTimers.get(userId));
  }

  const hour = settings.notificationHour || 9;
  const minute = settings.notificationMinute || 0;
  
  const scheduleNext = async () => {
    try {
      const currentSettings = await Settings.findOne({ userId });
      if (!currentSettings || !currentSettings.dailyReminders || !currentSettings.pushToken) {
        notificationTimers.delete(userId);
        return;
      }

      await sendPushNotification(
        currentSettings.pushToken,
        "MoodMate Reminder",
        "Time to check in with your mood! How are you feeling today?"
      );

      const msUntilNext = getTimeUntilNextNotification(
        currentSettings.notificationHour || 9,
        currentSettings.notificationMinute || 0
      );
      
      const timer = setTimeout(scheduleNext, msUntilNext);
      notificationTimers.set(userId, timer);
      console.log(`✅ Scheduled next notification for user ${userId} at ${hour}:${minute.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      notificationTimers.delete(userId);
    }
  };

  const msUntilFirst = getTimeUntilNextNotification(hour, minute);
  
  if (msUntilFirst >= 300000) {
    const timer = setTimeout(scheduleNext, msUntilFirst);
    notificationTimers.set(userId, timer);
    console.log(`✅ Scheduled daily notification for user ${userId} at ${hour}:${minute.toString().padStart(2, '0')} (in ${Math.floor(msUntilFirst / 60000)} minutes)`);
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hour, minute, 0, 0);
    tomorrow.setSeconds(0, 0);
    const msUntilTomorrow = tomorrow.getTime() - new Date().getTime();
    const timer = setTimeout(scheduleNext, msUntilTomorrow);
    notificationTimers.set(userId, timer);
    console.log(`✅ Scheduled daily notification for user ${userId} at ${hour}:${minute.toString().padStart(2, '0')} (tomorrow, in ${Math.floor(msUntilTomorrow / 60000)} minutes)`);
  }
};

app.put("/api/settings", authenticateToken, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = new Settings({
        userId: req.user.userId,
        ...req.body
      });
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = new Date();
    }
    await settings.save();
    
    if (settings.dailyReminders && req.body.dailyReminders === true) {
      if (settings.pushToken) {
        await scheduleNotificationForUser(req.user.userId, settings);
      } else {
        console.log(`⚠️ User ${req.user.userId} enabled notifications but no push token. Notifications will work locally on device.`);
      }
    } else if (!settings.dailyReminders) {
      if (notificationTimers.has(req.user.userId)) {
        clearTimeout(notificationTimers.get(req.user.userId));
        notificationTimers.delete(req.user.userId);
      }
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, async () => {
  console.log(`🚀 Server running on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  console.log(`📱 For mobile access, use your computer's IP address or set up ngrok/tunnel`);
  
  const allSettings = await Settings.find({ dailyReminders: true, pushToken: { $exists: true, $ne: null } });
  for (const settings of allSettings) {
    await scheduleNotificationForUser(settings.userId, settings);
  }
  console.log(`✅ Loaded ${allSettings.length} notification schedules`);
});
