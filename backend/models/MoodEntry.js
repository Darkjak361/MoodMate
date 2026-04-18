const mongoose = require("mongoose");

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

module.exports = mongoose.model("MoodEntry", MoodEntrySchema);
