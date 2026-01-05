const Trip = require("../models/Trip");
const Expense = require("../models/Expense");

exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const expenses = await Expense.find({ userId: req.user.id, tripId: id });
    res.json({ ...trip.toObject(), expenses });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
};

exports.createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, type, budget, notes } = req.body;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const trip = new Trip({
      userId: req.user.id,
      title,
      destination,
      startDate,
      endDate,
      tripType: type || "Leisure",
      budget: budget || 0,
      notes: notes || ""
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create trip" });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOneAndUpdate(
      { _id: id, userId: req.user.id },
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

exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTrip = await Trip.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deletedTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    await Expense.deleteMany({ tripId: id, userId: req.user.id });

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete trip" });
  }
};
