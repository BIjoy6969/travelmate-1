import { Request, Response } from 'express';
import Trip from '../models/Trip';


// If AuthRequest is not globally available/exported correctly, we might need to cast req
// checking if AuthRequest is available in middleware/auth.ts would be good, but for now assuming standard pattern.
// If it fails I will check middleware/auth

export const createTrip = async (req: Request, res: Response): Promise<void> => {
    try {
        const { destination, startDate, endDate, tripType, notes } = req.body;

        if (!destination || !startDate || !endDate || !tripType) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const trip = new Trip({
            user: req.user?._id, // Assuming req.user is populated by auth m_iddleware
            destination,
            startDate,
            endDate,
            tripType,
            notes
        });

        await trip.save();
        res.status(201).json(trip);
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({ message: 'Server error creating trip' });
    }
};

export const getTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const trips = await Trip.find({ user: req.user?._id }).sort({ startDate: 1 });
        res.json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ message: 'Server error fetching trips' });
    }
};

export const updateTrip = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { destination, startDate, endDate, tripType, notes } = req.body;

        const trip = await Trip.findOne({ _id: id, user: req.user?._id });
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }

        trip.destination = destination || trip.destination;
        trip.startDate = startDate || trip.startDate;
        trip.endDate = endDate || trip.endDate;
        trip.tripType = tripType || trip.tripType;
        trip.notes = notes !== undefined ? notes : trip.notes;

        await trip.save();
        res.json(trip);
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({ message: 'Server error updating trip' });
    }
};

export const deleteTrip = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const trip = await Trip.findOneAndDelete({ _id: id, user: req.user?._id });

        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }

        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({ message: 'Server error deleting trip' });
    }
};
