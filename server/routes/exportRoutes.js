const express = require("express");
const { exportTripPDF } = require("../controllers/exportController");

const router = express.Router();

router.get("/pdf", exportTripPDF);

module.exports = router;
