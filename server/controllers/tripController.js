import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";

/**
 * GET all trips (demo-friendly)
 */
export const getAllTrips = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

/**
 * GET trip by ID + expenses
 */
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const expenses = await Expense.find({ userId, tripId: id });
    res.json({ ...trip.toObject(), expenses });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
};

/**
 * CREATE trip
 */
export const createTrip = async (req, res) => {
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
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create trip" });
  }
};

/**
 * UPDATE trip
 */
export const updateTrip = async (req, res) => {
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
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update trip" });
  }
};

/**
 * ✅ DELETE trip (FIXED — demo + production safe)
 */
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    // ✅ DEMO FRIENDLY:
    // If userId exists → enforce it
    // If not → allow delete by id only
    const query = userId
      ? { _id: id, userId }
      : { _id: id };

    const deletedTrip = await Trip.findOneAndDelete(query);

    if (!deletedTrip) {
      return res
        .status(404)
        .json({ error: "Trip not found (or userId mismatch)" });
    }

    // ✅ Also delete related expenses
    await Expense.deleteMany({ tripId: id });

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete trip" });
  }
};
