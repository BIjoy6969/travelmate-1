const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");
const FlightBooking = require("../models/FlightBooking");
const Budget = require("../models/Budget");
const axios = require("axios");

exports.getDashboard = async (req, res) => {
  const { city, base = "USD", target = "BDT" } = req.query;
  const userId = req.user.id;

  try {
    console.log("Dashboard API called with query:", req.query);
    console.log("Using parameters -> userId:", userId, "city:", city, "base:", base, "target:", target);

    let trips = [];
    let expenses = [];
    let flights = [];
    let totalSpent = 0;
    let spendingByTrip = {};

    if (userId) {
      trips = await Trip.find({ userId }).sort({ createdAt: -1 });
      const tripIds = trips.map((t) => t._id.toString());
      expenses = await Expense.find({ userId, tripId: { $in: tripIds } });
      flights = await FlightBooking.find({ userId }).sort({ bookingDate: 1 });

      spendingByTrip = {};
      expenses.forEach((e) => {
        spendingByTrip[e.tripId] = (spendingByTrip[e.tripId] || 0) + e.amount;
      });

      totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Member 3 Integration: Add consolidated Budget expenses
      const budgets = await Budget.find({ userId });
      const budgetSpent = budgets.reduce((sum, b) => {
        const bExpenses = b.expenses?.reduce((s, e) => s + (Number(e.amount) || 0), 0) || 0;
        return sum + bExpenses;
      }, 0);
      totalSpent += budgetSpent;
    }

    let weather = null;
    if (city) {
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (apiKey && apiKey !== "your_openweather_api_key_here") {
        try {
          const wUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            city
          )}&appid=${apiKey}&units=metric`;

          const { data } = await axios.get(wUrl);

          weather = {
            city: data.name,
            country: data.sys?.country,
            temperature: data.main?.temp,
            feelsLike: data.main?.feels_like,
            humidity: data.main?.humidity,
            windSpeed: data.wind?.speed,
            description: data.weather?.[0]?.description,
            icon: data.weather?.[0]?.icon,
            updatedAt: new Date().toISOString(),
          };
        } catch (e) {
          weather = {
            error:
              e?.response?.data?.message ||
              "Failed to fetch weather (check city name or API key).",
          };
        }
      } else {
        weather = {
          error:
            "Weather API key not configured. Please set OPENWEATHER_API_KEY in server .env",
        };
      }
    }

    let currency = null;
    try {
      // Using exchangerate-api fallback since exchangerate.host might be shaky
      const cUrl = `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(base)}`;
      const { data } = await axios.get(cUrl);

      currency = {
        base,
        target,
        rate: data?.rates?.[target] ?? null,
        updatedAt: new Date().toISOString(),
      };
    } catch (e) {
      currency = {
        base,
        target,
        error: "Failed to fetch currency rate.",
      };
    }

    res.json({
      userId: userId || null,
      trips,
      expenses,
      flights,
      spendingByTrip,
      totalSpent,
      weather,
      currency,
    });
  } catch (err) {
    console.error("Dashboard Controller Error:", err);
    res.status(500).json({ error: "Failed to load dashboard", details: err.message });
  }
};
