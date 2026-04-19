const User = require("../models/User");
const Settings = require("../models/Settings");
const MoodEntry = require("../models/MoodEntry");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    let { username, email, password, name } = req.body;

    if (email) email = email.trim().toLowerCase();
    if (username) username = username.trim().toLowerCase();
    
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
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (email) email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user || !user.password) {
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
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      user = new User({ email, name, googleId, username: email.split("@")[0] });
      await user.save();

      const settings = new Settings({
        userId: user._id.toString(),
        dailyReminders: false,
        theme: "light"
      });
      await settings.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
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
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req.user;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Shield: If user has a password (not social login), we MUST verify it
    if (user.password) {
      if (!password) {
        return res.status(400).json({ error: "Password is required to delete account" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Incorrect password. Account was NOT deleted." });
      }
    }

    console.log(`🗑️ [Cleanup] Deleting data for user: ${userId}`);

    // 1. Delete Mood History
    const moodResult = await MoodEntry.deleteMany({ userId });
    console.log(`📉 Deleted ${moodResult.deletedCount} mood entries.`);

    // 2. Delete Settings
    await Settings.deleteOne({ userId });
    console.log(`⚙️ Deleted user settings.`);

    // 3. Delete User Profile
    await User.findByIdAndDelete(userId);
    console.log(`👤 Deleted user account: ${user.email}`);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Account Error:", error);
    res.status(500).json({ error: "Internal server error during account deletion" });
  }
};
