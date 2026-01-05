const express = require("express");
const { exportTripPDF } = require("../controllers/exportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/pdf", protect, exportTripPDF);

module.exports = router;
