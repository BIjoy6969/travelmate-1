<<<<<<< HEAD
const express = require("express");
const axios = require("axios");

const router = express.Router();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// GET /api/weather?city=Dhaka
router.get("/", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const url = "https://api.openweathermap.org/data/2.5/weather";

    const response = await axios.get(url, {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: "metric" // Celsius
      }
    });

    const data = response.data;

    const result = {
      city: data.name,
      country: data.sys.country,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };

    return res.json(result);
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    return res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

module.exports = router;
=======
import express from "express";
import { getWeather } from "../controllers/weatherController.js";

const router = express.Router();

router.get("/", getWeather);

export default router;

>>>>>>> origin/member4-bijoy
