const moodInsightsData = require("../data/moodInsights.json");

/**
 * MoodMate Industrial Insight Engine
 * Mathematically generates unique, clinical-grade combinations on-the-fly.
 */
const getMoodInsight = (mood) => {
  const segments = moodInsightsData;
  const cat = segments[mood] || segments.NEUTRAL;
  
  const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const opener = getRand(cat.openers);
  const lesson = getRand(cat.lessons);
  const action = getRand(cat.actions);
  const emoji = getRand(cat.emojis);

  return `${opener} ${lesson}\n\n______________\n\nAction: ${action} ${emoji}`;
};

module.exports = { getMoodInsight };
