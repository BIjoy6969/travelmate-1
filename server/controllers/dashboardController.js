import mongoose from "mongoose";
import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";
import FlightBooking from "../models/FlightBooking.js";
import axios from "axios";

export const getDashboard = async (req, res) => {
  const { userId, city, base = "USD", target = "BDT" } = req.query;

  try {
    // -----------------------------
    // 1) Database summary (optional)
    // -----------------------------
    // For demo-without-login, userId may be missing.
    // If userId is missing or invalid, we return a "public" dashboard summary:
    // - trips/expenses/flights will be empty, but weather/currency still work.
    let trips = [];
    let expenses = [];
    let flights = [];
    let totalSpent = 0;
    let spendingByTrip = {};

    if (userId) {
      const validObjectId = mongoose.isValidObjectId(userId);

      // Trips use ObjectId in schema; expenses/flights use String in this project.
      if (validObjectId) {
        trips = await Trip.find({ userId }).sort({ createdAt: -1 });
        const tripIds = trips.map((t) => t._id.toString());
        expenses = await Expense.find({ userId, tripId: { $in: tripIds } });
        flights = await FlightBooking.find({ userId }).sort({ date: 1 });

        spendingByTrip = {};
        expenses.forEach((e) => {
          spendingByTrip[e.tripId] = (spendingByTrip[e.tripId] || 0) + e.amount;
        });

        totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      } else {
        // If someone passes a string userId, we can still show expenses/flights (stored as String).
        expenses = await Expense.find({ userId });
        flights = await FlightBooking.find({ userId }).sort({ date: 1 });

        spendingByTrip = {};
        expenses.forEach((e) => {
          spendingByTrip[e.tripId] = (spendingByTrip[e.tripId] || 0) + e.amount;
        });

        totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      }
    }

    // -----------------------------
    // 2) Weather (Member-4)
    // -----------------------------
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
          // Non-fatal: dashboard still returns currency + db data.
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

    // -----------------------------
    // 3) Currency conversion (Member-4)
    // -----------------------------
    let currency = null;
    try {
      const cUrl = `https://api.exchangerate.host/convert?from=${encodeURIComponent(
        base
      )}&to=${encodeURIComponent(target)}&amount=1`;
      const { data } = await axios.get(cUrl);

      currency = {
        base,
        target,
        rate: data?.info?.rate ?? null,
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
    console.error(err);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};
