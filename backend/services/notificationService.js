const fetch = require("node-fetch"); // Note: Using node-fetch or native fetch if available
const Settings = require("../models/Settings");

const notificationTimers = new Map();

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

    return await response.json();
  } catch (error) {
    console.error("Push notification error:", error);
    return null;
  }
};

const getTimeUntilNextNotification = (hour, minute) => {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  
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
      console.log(`✅ [Service] Scheduled next notification for user ${userId} at ${hour}:${minute.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      notificationTimers.delete(userId);
    }
  };

  const msUntilFirst = getTimeUntilNextNotification(hour, minute);
  const timer = setTimeout(scheduleNext, msUntilFirst);
  notificationTimers.set(userId, timer);
  console.log(`✅ [Service] Initialized notification for user ${userId} at ${hour}:${minute.toString().padStart(2, '0')}`);
};

module.exports = { scheduleNotificationForUser };
