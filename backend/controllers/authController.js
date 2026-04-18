const User = require("../models/User");
const Settings = require("../models/Settings");
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
