const MoodEntry = require("../models/MoodEntry");
const { getMoodInsight } = require("../utils/insightEngine");

exports.analyzeMood = async (req, res) => {
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

    // Note: Simple mock for industrial analysis. In production, connect to HF_API.
    // This maintains the structure for the Capstone requirements.
    const analyzeMoodSimple = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes("happy") || lower.includes("good") || lower.includes("great") || lower.includes("joy")) {
        return { mood: "POSITIVE", score: 0.9 };
      }
      if (lower.includes("sad") || lower.includes("bad") || lower.includes("tired") || lower.includes("stressed")) {
        return { mood: "NEGATIVE", score: 0.3 };
      }
      return { mood: "NEUTRAL", score: 0.5 };
    };

    let sentiment;
    if (emojiMood && emojiMoodMap[emojiMood.toLowerCase()]) {
      const mood = emojiMoodMap[emojiMood.toLowerCase()];
      sentiment = { mood, score: 0.75 };
    } else {
      sentiment = analyzeMoodSimple(text);
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
};

exports.getHistory = async (req, res) => {
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

    const entries = await MoodEntry.find(query).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.clearHistory = async (req, res) => {
    try {
      const userId = req.user.userId;
      const result = await MoodEntry.deleteMany({ userId });
      res.json({
        message: "All mood data deleted",
        deletedCount: result.deletedCount
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
};

exports.deleteEntry = async (req, res) => {
  try {
    const entry = await MoodEntry.findById(req.params.id);
    if (!entry || entry.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }
    await MoodEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getStats = async (req, res) => {
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
};
