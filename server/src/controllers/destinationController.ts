import { Request, Response } from 'express';
import Destination from '../models/Destination';
import { IUser } from '../models/User';

// @desc    Get all destinations for logged in user
// @route   GET /api/destinations
// @access  Private
const getDestinations = async (req: Request, res: Response) => {
    try {
        const destinations = await Destination.find({ user: req.user?._id } as any);
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a destination
// @route   POST /api/destinations
// @access  Private
const addDestination = async (req: Request, res: Response) => {
    const { place_id, name, address, lat, lng, notes } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const destination = new Destination({
            user: req.user._id,
            place_id,
            name,
            address,
            lat,
            lng,
            notes,
        });

        const createdDestination = await destination.save();
        res.status(201).json(createdDestination);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a destination
// @route   DELETE /api/destinations/:id
// @access  Private
const deleteDestination = async (req: Request, res: Response) => {
    try {
        const destination = await Destination.findById(req.params.id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        if (!req.user || destination.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await destination.deleteOne();
        res.json({ message: 'Destination removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getDestinations, addDestination, deleteDestination };
