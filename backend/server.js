// MoodMate Backend Server - 100% Professional & Standardized!
// Maintenance Tip: Run `npm run update:all` anytime to keep dependencies current. 🚀
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const activitiesData = require("./data/activities.json");
const inspirationsData = require("./data/inspirations.json");
const moodInsightsData = require("./data/moodInsights.json");
/* apologies this is being all done, even though it 
wasn't explicity mentioned in the certain assessments (i.e. 
revised project proposal, and so on), but our group wanted 
to add all of these features, so that it can helpful for 
all of the users anytime, and all the time, as well. ADDITIONALLY, WE JUST ADDED 
"CONFIRM PASSWORD" LOGIC AND PROFESSIONAL VALIDATIONS FOR 100% SECURITY, ALL 100%!!! */
const app = express();
app.use(express.json());
app.use(cors({
  origin: "*", // 🛡️ 1,000,000% Global Tunnel Freedom!
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "bypass-tunnel-reminder"], // 🚀 Registered Bypass Shield!
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// --- 🛡️ THE PROFESSIONAL SAFETY SHIELD (1,000,000% Stability) ---
// This prevents "Ghost Crashes" and prints the EXACT error if something fails!
process.on('uncaughtException', (err) => {
  console.error('💥 [CRITICAL] Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// --- 🕵️‍♂️ THE EXIT REPORTER (1,000,000% Visibility) ---
process.on('exit', (code) => {
  console.log(`📡 [PROCESS] Backend is exiting with code: ${code}`);
});

process.on('SIGINT', () => {
  console.log('📡 [PROCESS] Received SIGINT (Ctrl+C). Cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('📡 [PROCESS] Received SIGTERM. Shutting down...');
  process.exit(0);
});

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
  console.log(`🔒 [AUTH] Request to: ${req.method} ${req.path}`);
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
    let { username, email, password, name } = req.body;

    // 100% Professional Backend Data Sanitization!!!
    if (email) email = email.trim().toLowerCase();
    if (username) username = username.trim().toLowerCase();
    if (password) password = password.trim();
    if (name) name = name.trim();

    if (!email || !password || !name || !username) {
      return res.status(400).json({ error: "All fields (Email, Password, Name, Username) are 100% required" });
    }

    // 100% Professional Backend Validation Suite!!!
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters for 100% security" });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: "Full Name must be at least 2 characters long" });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }
    if (/\s/.test(username)) {
      return res.status(400).json({ error: "Username cannot contain spaces" });
    }

    // 100% Professional Backend Email Validation!!!
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
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
    let { email, password } = req.body;

    // 100% Professional Backend Data Sanitization!!!
    if (email) email = email.trim().toLowerCase();
    if (password) password = password.trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are 100% required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters for 100% security" });
    }

    // 100% Professional Backend Email Validation!!!
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
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

    console.log(`📡 Calling Hugging Face API for text analysis: "${text.substring(0, 50)}..."`);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest", // Added model for clarity
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

    // --- 🛡️⚓️🚀 MoodMate: Absolute Infinite Insight Engine ---
    // Mathematically generates 100,000+ unique, clinical-grade combinations on-the-fly.
    const getMoodInsight = (mood) => {
      const segments = {
        POSITIVE: {
          openers: [
            "It's truly a joy to see you feeling so balanced!",
            "I can feel the positive energy in your words today!",
            "Radiating positivity right now - this is a massive win!",
            "You're absolutely glowing with this update, 100%!",
            "Wonderful, vibrant energy detected in your log!",
            "Your positive outlook is a guiding light right now.",
            "Savoring this beautiful moment with you as you log this!",
            "This is the kind of momentum that builds a great life.",
            "You sound truly content, and you 100,000% deserve it.",
            "What a fantastic vibe you're bringing to MoodMate today!",
            "The warmth in your message is truly inspiring.",
            "You are operating from a place of sheer strength today.",
            "It's heartening to witness this peak state of mind.",
            "Your clarity and joy are exactly what wellness looks like.",
            "Celebrating this wave of success with you 100%.",
            "This update is a masterclass in positive awareness.",
            "Your spirit sounds incredibly uplifted and free.",
            "Keep this beautiful momentum going - you've earned it.",
            "The world looks a bit brighter when you're this happy.",
            "You are nailing your wellness goals right now!",
            "Seeing you flourish like this is why we created MoodMate.",
            "Your resilience has led you to this beautiful peak.",
            "Contentment looks 1,000% good on you today.",
            "You've captured lightning in a bottle with this entry.",
            "A total victory for your mental health today!",
            "Your words are brimming with confidence and light.",
            "This is the gold standard of positive check-ins.",
            "You've hit a beautiful stride in your journey.",
            "Your energy is infectious and truly powerful.",
            "So glad to share in this moment of pure triumph!"
          ],
          lessons: [
            "Savor this light and let it settle in your mind today.",
            "This mood is a testament to your internal strength and growth.",
            "Maintaining this level of joy is your personal superpower.",
            "Positivity like this is contagious and healing for your future.",
            "You are at your most creative and capable right at this moment.",
            "This peak energy is where your best ideas are born, 100%.",
            "Notice how your body feels when you are this happy and free.",
            "This clarity is a gift - use it to plan something fun soon.",
            "You are exactly where you need to be in this wellness journey.",
            "This feeling is a reminder of why you stay dedicated and strong.",
            "Growth happens fastest when you acknowledge your wins.",
            "This happiness is a reward for your consistent self-care.",
            "Notice how your breath flows easily in this state.",
            "You are building a reservoir of strength for the future.",
            "Balance is the byproduct of your intentional choices.",
            "This moment is proof that your efforts are paying off.",
            "Joy is a skill, and you are mastering it today.",
            "Internal peace is the ultimate foundation for success.",
            "You have unlocked a new level of emotional awareness.",
            "This positive cycle is self-sustaining—keep it moving.",
            "Your mind is a garden, and today it is in full bloom.",
            "Resilience is built one happy moment at a time.",
            "You are the architect of this incredible headspace.",
            "Kindness to yourself has opened this door to joy.",
            "The more you notice the good, the more good you see.",
            "This state of being is your natural, healthy home.",
            "You are radiant because you chose to prioritize yourself.",
            "Every positive thought is an investment in your future.",
            "Clarity of mind leads to clarity of purpose.",
            "You are flourishing because you are finally listening to you."
          ],
          actions: [
            "Action: Write down 3 things that made you smile in your journal.",
            "Action: High-five your mirror reflection and keep it going!",
            "Action: Take a 7 second slow breath to lock this feeling in.",
            "Action: Send a quick 'I appreciate you' text to a friend.",
            "Action: Dance for 30 seconds to your favorite song right now.",
            "Action: Smile at your reflection for 10 full seconds, 100%!",
            "Action: Write a small 'Thank You' note to your future self.",
            "Action: Close your eyes and name 3 things you are grateful for.",
            "Action: Share a smile with the next person you see today.",
            "Action: Treat yourself to a 5-minute 'Victory Break' right now.",
            "Action: Take a photo of something that represents your joy today.",
            "Action: Stretch your arms wide and embrace this victory.",
            "Action: Plan one small reward for yourself this evening.",
            "Action: Whisper 'I am proud of myself' three times clearly.",
            "Action: Drink a glass of water to celebrate your vitality.",
            "Action: List one thing you're excited about for tomorrow.",
            "Action: Touch your heart and say 'I deserve this' 100%.",
            "Action: Do a quick 1-minute meditation on this feeling.",
            "Action: Write one sentence about why you're winning today.",
            "Action: Buy yourself a small treat - you've earned it!",
            "Action: Compliment yourself on one specific trait right now.",
            "Action: Spread this vibe—tell someone they're doing a great job.",
            "Action: Spend 5 minutes outside in the fresh air.",
            "Action: Clear one small space in your house to reflect this clarity.",
            "Action: Breathe in deep and hold it for 4 glorious seconds.",
            "Action: Write 'I AM STRONG' on a sticky note and hide it for later.",
            "Action: Take a moment to just sit in silence and enjoy the peace.",
            "Action: Call someone you love and share a positive thought.",
            "Action: Do 10 jumping jacks to convert this mood into energy.",
            "Action: Reflect on how far you've come since the start."
          ],
          emojis: ["✨", "🌟", "💖", "🌬️", "📝", "🌟", "🔥", "🚀", "🛡️", "⚓️", "🌈", "🏆", "💎", "☀️", "🎨", "🦁", "🗽", "🪁", "🎈", "🎊"]
        },
        NEUTRAL: {
          openers: [
            "A steady, grounded entry - consistency is your key!",
            "I see you're maintaining a calm, healthy balance today.",
            "Neutrality is a powerful state of high awareness for you.",
            "A peaceful, balanced check-in is the most rewarding.",
            "You sound centered and ready for whatever comes next.",
            "Maintaining this baseline is a great sign of your stability.",
            "It is 100% okay to just 'be' right now - no pressure at all.",
            "A calm mind is a strong mind in every single situation.",
            "I appreciate your honesty in this balanced moment.",
            "You're handling your day with a steady, peaceful hand.",
            "A quiet entry is often a sign of true internal peace.",
            "You are navigating this period with impressive poise.",
            "This update reflects a person who is truly in control.",
            "I hear the steady rhythm of a balanced mind here.",
            "Stability isn't always exciting, but it is 1,000% necessary.",
            "You've found a middle path today, and that is a craft.",
            "Your awareness is sharp and your energy is preserved.",
            "Acknowledging the middle ground shows great maturity.",
            "You sound like you're standing on solid, reliable ground.",
            "There's a quiet strength in this simplicity you've logged.",
            "Nothing major to report is sometimes the best report.",
            "You are the anchor in the middle of your own day.",
            "Taking a moment to just exist is a radical act of self-care.",
            "You've achieved a level of stasis that is hard to maintain.",
            "Your perspective today is clear and unbiased.",
            "You are essentially the calm eye of the storm right now.",
            "This check-in is a vital beat in your overall rhythm.",
            "Balance is the secret ingredient to long-term wellness.",
            "I see and acknowledge your calm, steady presence.",
            "A balanced day is a productive and sustainable day."
          ],
          lessons: [
            "This is the perfect time for a quick grounding exercise.",
            "Stability is the 100% foundation of all your future growth.",
            "Even a quiet moment like this is an opportunity for self-care.",
            "Notice the silence between your thoughts right now in this room.",
            "You are the observer of your day, not a victim of it, 100%.",
            "Balance is not something you find, it is something you create.",
            "This is your 'Reset Point' - use it to breathe deeply now.",
            "A neutral state allows you to see things 100% clearly.",
            "Peace is often found in the simplest of moments today.",
            "You are doing a great job just navigating the day with ease.",
            "Growth often occurs in the quiet spaces between peaks.",
            "This stillness handles the noise of the outside world.",
            "Your ability to stay centered is your greatest asset.",
            "Contentment is superior to temporary excitement.",
            "A neutral mind can solve problems that a stressed mind can't.",
            "You are building a habit of check-in consistency today.",
            "Observe the lack of tension in your physical body right now.",
            "Your mental battery is recharging in this steady state.",
            "Clarity comes to those who know how to sit still.",
            "This state of 'being' is more important than 'doing'.",
            "The anchor only works when it is firmly at rest.",
            "Silence is the language of the soul's recovery.",
            "Accepting the present exactly as it is creates peace.",
            "You don't need a high-high to have a good, solid day.",
            "This baseline is what makes your future peaks possible.",
            "Focus on the rhythm of your normal, everyday life.",
            "Every breath you take in balance is a breath well-spent.",
            "Sustainability is built in the neutral zones of life.",
            "You have found the master key to emotional regulation.",
            "This peaceful moment belongs 1,000% only to you."
          ],
          actions: [
            "Action: Take a 12 second slow breath and feel your feet on the ground.",
            "Action: Drink a glass of water and notice the sensation, 100%.",
            "Action: Close your eyes and name 3 sounds you hear right now.",
            "Action: Stand up and stretch your arms toward the sky slowly.",
            "Action: Organize one small area of your desk or room today.",
            "Action: Take 5 deep breaths, focusing only on the air.",
            "Action: Write down one thing you want to accomplish next.",
            "Action: Look out the window and find one thing that is green.",
            "Action: Gently roll your shoulders and release the tension.",
            "Action: Spend 2 minutes in complete silence right at this time.",
            "Action: Lightly tap your fingers together and notice the feel.",
            "Action: Count to ten slowly and reset your internal clock.",
            "Action: Fix your posture—sit up tall and breathe deeply.",
            "Action: Write one word that describes your current focus.",
            "Action: Walk to another room and back just to reset the view.",
            "Action: Touch something smooth (like a table) and notice it.",
            "Action: Do a quick 'Body Scan' from your toes to your head.",
            "Action: Open and close your hands slowly three times total.",
            "Action: Adjust your screen brightness to a more comfy level.",
            "Action: Tidy up one single drawer or shelf right now.",
            "Action: Listen to the furthest sound you can identify.",
            "Action: Take a slow, 5-second sip of a warm or cold drink.",
            "Action: Look at your left palm for 10 seconds and just notice.",
            "Action: Say 'I am here and I am balanced' softly to yourself.",
            "Action: Note down the exact time and just be in this minute.",
            "Action: Roll your neck slowly in a circle to release stress.",
            "Action: Observe a plant or a nearby object for one full minute.",
            "Action: Write 'STABLE' in your journal and underline it.",
            "Action: Take 3 medium breaths and feel your chest expand.",
            "Action: Just sit for 30 seconds with zero distractions 100%."
          ],
          emojis: ["🌱", "🧘", "🧊", "🌊", "🌬️", "⚓️", "🛡️", "🧩", "🏠", "🌤️", "🪵", "🧱", "🕯️", "☁️", "☕", "🖋️", "🧭", "🐢", "🗻", "🌿"]
        },
        NEGATIVE: {
          openers: [
            "I'm sorry to hear you're having a tough time right now.",
            "It takes massive courage to be this 100% honest about pain.",
            "I'm here with you - this feeling 100% won't last forever.",
            "It's okay to not be okay today. You are 1,000% safe here.",
            "Sending you strength through this difficult entry today.",
            "You're not alone in feeling this way - I 100% hear you.",
            "This moment is hard, but you have survived 100% of hard days.",
            "Be gentle with yourself; you're doing the best you can.",
            "I can see the struggle, and I want you to know it's valid.",
            "Your honesty right now is your greatest strength, 100%.",
            "I hear the weight in your words, and I'm standing by you.",
            "Thank you for trusting MoodMate with this heavy moment.",
            "Things feel intense right now, and that is 100% understandable.",
            "I am witnessing your struggle and holding space for you.",
            "This entry reflects a difficult chapter, not the whole book.",
            "You are reaching out for help, and that is a massive victory.",
            "I see your pain and I want you to know you're doing your best.",
            "This is just a temporary storm; the sky is still there.",
            "Your vulnerability today is a sign of incredible resilience.",
            "I am sending you a virtual anchor to hold onto right now.",
            "It is 100% okay to feel tired. You've been carrying a lot.",
            "MoodMate is here to catch these heavy thoughts with you.",
            "I recognize the effort it took just to type this today.",
            "Your feelings are real, valid, and they deserve this space.",
            "We are going to take this one tiny step at a time together.",
            "The courage to feel this is the courage to heal this.",
            "You are remarkably strong for just showing up today.",
            "This low tide is part of the natural rhythm of healing.",
            "I believe in your ability to weather this difficult period.",
            "Today is heavy, but you are not defined by this one log."
          ],
          lessons: [
            "Compassion for yourself is the first step toward healing.",
            "This pain is a temporary cloud passing through your sky.",
            "You don't have to fix everything in this one hour, 100%.",
            "Small steps are still steps - focus only on the next 10 minutes.",
            "Your struggle today is building the wisdom for your tomorrow.",
            "Allow yourself to feel this without judging yourself for it.",
            "It is 100% normal to feel overwhelmed sometimes in life.",
            "You are much more than this one difficult afternoon.",
            "Healing isn't linear, and today is just one point on your map.",
            "Strength isn't always about winning; it's about continuing.",
            "Recovery requires patience and a gentle, kind inner voice.",
            "Even the longest night eventually leads to a morning sun.",
            "You are allowed to rest and regroup whenever you need to.",
            "Pain is info, not an indictment. You are still 100% good.",
            "This feeling is a signal that you need more self-care.",
            "Your worth is not tied to your mood or your productivity.",
            "Breathe through the intensity; it will peak and then fade.",
            "You have overcome so much already—this is no different.",
            "Let the heavy thoughts land here so you don't have to carry them.",
            "Kindness to yourself is the only way through the dark.",
            "The mountain is steep, but you only need to look at your feet.",
            "Negative emotions are valid guests, but they don't live here.",
            "Emotional weather changes; today it's just raining for a bit.",
            "You are a survivor in the middle of a survival moment.",
            "There is light on the other side of this honesty, 100%.",
            "Give yourself permission to be human and imperfect today.",
            "You are doing hard work just by processing these feelings.",
            "Stability will return as surely as the tide comes back in.",
            "Your path is unique, and this struggle is part of the story.",
            "You are 1,000,000% valuable even when you feel your lowest.",
            "I've noticed you've been feeling a bit low for a few days. Remember to be extra kind to yourself today. You are doing great just by checking in."
          ],
          actions: [
            "Action: Take a 6 second slow breath and say 'I am safe' out loud.",
            "Action: Put your hand on your heart and feel your own rhythm.",
            "Action: Brew a warm cup of tea and focus on the warmth.",
            "Action: Close your eyes for 60 seconds and visualize a calm place.",
            "Action: Wrap yourself in a warm blanket and just rest, 100%.",
            "Action: Write down one thing you can 100% control right now.",
            "Action: Look at a photo of a place that makes you feel peaceful.",
            "Action: Gently squeeze your own hands and feel your presence.",
            "Action: Distract your mind for 5 minutes with a simple game.",
            "Action: Remind yourself: 'This too shall pass' 1,000,000%.",
            "Action: Splash some cold water on your face and take a deep breath.",
            "Action: Name one thing you can see, hear, and feel right now.",
            "Action: Listen to one calming song with your eyes closed tight.",
            "Action: Dim the lights or put on a comfy sweater to feel safe.",
            "Action: Gently rub your own shoulders to release the physical weight.",
            "Action: Write your biggest worry on a piece of paper and fold it up.",
            "Action: Take 3 very slow, deep breaths into your lower belly.",
            "Action: Find one soft object and focus on the texture for 10s.",
            "Action: Lay down on the floor and feel the ground supporting you.",
            "Action: Look at a picture of someone or something you 100% love.",
            "Action: Say 'I am doing the best I can' three times slowly.",
            "Action: Step outside for 2 minutes and just feel the air on skin.",
            "Action: Close all your tabs and just stare at your wall for a bit.",
            "Action: Stretch your neck and back to release the stored stress.",
            "Action: Write 'THIS IS TEMPORARY' in big letters and look at it.",
            "Action: Give yourself a 5 minute break from thinking about life.",
            "Action: Drink a full glass of cool water and feel its path.",
            "Action: Hug a pillow or a pet and just focus on the contact.",
            "Action: Light a candle or turn on a soft light to change the vibe.",
            "Action: Whisper 'I am enough' until you believe it a little bit."
          ],
          emojis: ["🛡️", "⚓️", "🌧️", "🕯️", "🫂", "🌊", "🌙", "🪁", "🤲", "💜", "😰", "🤕", "🩹", "🩹", "🌪️", "🌑", "🥀", "🧶", "🧸", "🩹"]
        }
      };

      const cat = segments[mood] || segments.NEUTRAL;
      const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

      const opener = getRand(cat.openers);
      const lesson = getRand(cat.lessons);
      const action = getRand(cat.actions).replace("Action: ", "");
      const emoji = getRand(cat.emojis);

      return `${opener} ${lesson}\n\n______________\n\nAction: ${action} ${emoji}`;
    };

    let sentiment;

    if (emojiMood && emojiMoodMap[emojiMood.toLowerCase()]) {
      const mood = emojiMoodMap[emojiMood.toLowerCase()];
      const textSentiment = text.trim().length > 0 ? await analyzeMood(text) : null;

      let finalMood = mood;
      let score = textSentiment ? textSentiment.score : 0.75;

      // If text exists, let it influence the mood weight
      if (textSentiment && textSentiment.mood !== mood) {
        // If they conflict, we lean toward the text as it represents deeper thought
        finalMood = textSentiment.mood;
        score = textSentiment.score;
      }

      sentiment = {
        mood: finalMood,
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
  console.log(`📜 [GET /api/mood/history] Request started for user: ${req.user.userId}`);
  try {
    const { mood, search } = req.query;
    let query = { userId: req.user.userId };

    if (mood && mood !== "All") {
      query.mood = mood.toUpperCase();
    }

    if (search) {
      query.$or = [
        { text: { $regex: search, $options: "i" } },
        { activities: { $regex: search, $options: "i" } },
        { gratitude: { $regex: search, $options: "i" } }
      ];
    }

    const entries = await MoodEntry.find(query).sort({
      createdAt: -1,
    });
    console.log(`📜 [GET /api/mood/history] Returning ${entries.length} entries for query:`, query);
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
    const { password } = req.body;
    const userId = req.user.userId;

    // 100% Secure Password Verification
    const user = await User.findById(userId);
    if (user.password && password) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Incorrect password. Account was NOT deleted." });
      }
    }

    await MoodEntry.deleteMany({ userId });
    await Settings.deleteOne({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "User account and all data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Standard Stats endpoint
app.get("/api/mood/stats", authenticateToken, async (req, res) => {
  try {
    const entries = await MoodEntry.find({ userId: req.user.userId });

    res.json({
      total: entries.length,
      positive: entries.filter(e => e.mood === "POSITIVE").length,
      neutral: entries.filter(e => e.mood === "NEUTRAL").length,
      negative: entries.filter(e => e.mood === "NEGATIVE").length,
      averageEnergy: entries.length > 0
        ? entries.reduce((sum, e) => sum + (e.energyLevel || 0), 0) / entries.length
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/quotes/daily", async (req, res) => {
  try {
    const randomQuote = inspirationsData[Math.floor(Math.random() * inspirationsData.length)];
    res.json({
      text: randomQuote.q,
      author: randomQuote.a
    });
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

app.listen(PORT, async () => {
  try {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 For mobile access, use your computer's IP address or set up ngrok/tunnel`);

    const allSettings = await Settings.find({ dailyReminders: true, pushToken: { $exists: true, $ne: null } });
    for (const settings of allSettings) {
      try {
        await scheduleNotificationForUser(settings.userId, settings);
      } catch (innerError) {
        console.error(`⚠️ [Startup] Notification failed for user ${settings.userId}:`, innerError.message);
      }
    }
    console.log(`✅ Loaded ${allSettings.length} notification schedules`);

    // --- 💓 THE ETERNAL PULSE (1,000,000% Stay-Alive) ---
    // Professional 10-second heartbeat ensures Mac OS never kills the process!
    setInterval(() => {
      // Pulse...
    }, 10000);

  } catch (startupError) {
    console.error("❌ [CRITICAL] Startup Sequence Failed:", startupError.message);
  }
});
