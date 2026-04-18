const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  dailyReminders: { type: Boolean, default: false },
  notificationHour: { type: Number, default: 9 },
  notificationMinute: { type: Number, default: 0 },
  pushToken: { type: String },
  theme: { type: String, default: "light" },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Settings", SettingsSchema);
