import { Request, Response } from "express";
import mongoose from "mongoose";
import Trip from "../models/Trip";
import Expense from "../models/Expense";
import FlightBooking from "../models/FlightBooking";
import axios from "axios";

export const getDashboard = async (req: Request, res: Response) => {
    const { userId, city, base = "USD", target = "BDT" } = req.query;

    try {
        let trips: any[] = [];
        let expenses: any[] = [];
        let flights: any[] = [];
        let totalSpent = 0;
        let spendingByTrip: any = {};

        if (userId) {
            const validObjectId = mongoose.isValidObjectId(userId);

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
                expenses = await Expense.find({ userId });
                flights = await FlightBooking.find({ userId }).sort({ date: 1 });

                spendingByTrip = {};
                expenses.forEach((e) => {
                    spendingByTrip[e.tripId] = (spendingByTrip[e.tripId] || 0) + e.amount;
                });

                totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            }
        }

        // Weather
        let weather: any = null;
        if (city) {
            const apiKey = process.env.OPENWEATHER_API_KEY;

            if (apiKey && apiKey !== "your_openweather_api_key_here") {
                try {
                    const wUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                        city as string
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
                } catch (e: any) {
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

        // Currency
        let currency: any = null;
        try {
            const cUrl = `https://api.exchangerate.host/convert?from=${encodeURIComponent(
                base as string
            )}&to=${encodeURIComponent(target as string)}&amount=1`;
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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Failed to load dashboard" });
    }
};
