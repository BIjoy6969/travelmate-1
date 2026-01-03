import FlightBooking from "../models/FlightBooking.js";

export const getAllFlights = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const flights = await FlightBooking.find({ userId }).sort({ date: 1 });
    res.json(flights);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
};

export const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const flight = await FlightBooking.findOne({ _id: id, userId });
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    res.json(flight);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch flight" });
  }
};

export const createFlight = async (req, res) => {
  try {
    const { userId, from, to, date, price, airline, bookingRef } = req.body;

    if (!userId || !from || !to || !date || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const flight = new FlightBooking({
      userId,
      from,
      to,
      date,
      price: Number(price),
      airline: airline || "Unknown",
      bookingRef: bookingRef || "",
    });

    await flight.save();
    res.status(201).json(flight);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create flight" });
  }
};

export const updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const updateData = req.body;

    const flight = await FlightBooking.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    res.json(flight);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update flight" });
  }
};

export const deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const flight = await FlightBooking.findOneAndDelete({ _id: id, userId });
    if (!flight) {
      return res.status(404).json({ error: "Flight not found" });
    }

    res.json({ message: "Flight deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to delete flight" });
  }
};

