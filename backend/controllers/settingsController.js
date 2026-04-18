const Settings = require("../models/Settings");
const User = require("../models/User");
const MoodEntry = require("../models/MoodEntry");
const bcrypt = require("bcryptjs");

const { scheduleNotificationForUser } = require("../services/notificationService");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = new Settings({ userId: req.user.userId });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = new Settings({ userId: req.user.userId, ...req.body });
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = new Date();
    }
    await settings.save();

    if (settings.dailyReminders && req.body.dailyReminders === true) {
        await scheduleNotificationForUser(req.user.userId, settings);
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (user.password && password) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Incorrect password" });
      }
    }

    await MoodEntry.deleteMany({ userId });
    await Settings.deleteOne({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "User account and all data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
