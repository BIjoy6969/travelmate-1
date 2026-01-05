const express = require("express");
const { convertCurrency } = require("../controllers/currencyController");

const router = express.Router();

router.get("/", convertCurrency);

module.exports = router;
