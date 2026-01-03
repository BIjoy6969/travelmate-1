import { Request, Response } from "express";
import Trip from "../models/Trip";
import Expense from "../models/Expense";

/**
 * GET all trips (demo-friendly)
 */
export const getAllTrips = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch trips" });
    }
};

/**
 * GET trip by ID + expenses
 */
export const getTripById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        const trip = await Trip.findOne({ _id: id, userId });
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }

        const expenses = await Expense.find({ userId, tripId: id });
        res.json({ ...trip.toObject(), expenses });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch trip" });
    }
};

/**
 * CREATE trip
 */
export const createTrip = async (req: Request, res: Response) => {
    try {
        const { userId, title, destination, startDate, endDate, type } = req.body;

        if (!userId || !title || !destination || !startDate || !endDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const trip = new Trip({
            userId,
            title,
            destination,
            startDate,
            endDate,
            type: type || "Leisure",
        });

        await trip.save();
        res.status(201).json(trip);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to create trip" });
    }
};

/**
 * UPDATE trip
 */
export const updateTrip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        const trip = await Trip.findOneAndUpdate(
            { _id: id, userId },
            req.body,
            { new: true }
        );

        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }

        res.json(trip);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update trip" });
    }
};

/**
 * DELETE trip
 */
export const deleteTrip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        const query = userId ? { _id: id, userId } : { _id: id };

        const deletedTrip = await Trip.findOneAndDelete(query);

        if (!deletedTrip) {
            return res.status(404).json({ error: "Trip not found" });
        }

        await Expense.deleteMany({ tripId: id });
        res.json({ message: "Trip deleted successfully" });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete trip" });
    }
};
