const express = require("express");
const router = express.Router();
const moodController = require("../controllers/moodController");
const authenticateToken = require("../middleware/auth");

router.post("/analyze", authenticateToken, moodController.analyzeMood);
router.get("/history", authenticateToken, moodController.getHistory);
router.delete("/history", authenticateToken, moodController.clearHistory);
router.delete("/:id", authenticateToken, moodController.deleteEntry);
router.get("/stats", authenticateToken, moodController.getStats);

module.exports = router;
