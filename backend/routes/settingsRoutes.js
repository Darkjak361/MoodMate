const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const authenticateToken = require("../middleware/auth");

router.get("/", authenticateToken, settingsController.getSettings);
router.put("/", authenticateToken, settingsController.updateSettings);
router.delete("/user", authenticateToken, settingsController.deleteUser);

module.exports = router;
