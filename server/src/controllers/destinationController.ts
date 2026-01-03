import { Request, Response } from 'express';
import axios from 'axios';
import Destination from '../models/Destination';
import { IUser } from '../models/User';

// @desc    Get all destinations for logged in user
// @route   GET /api/destinations
// @access  Private
const getDestinations = async (req: Request, res: Response) => {
    try {
        const destinations = await Destination.find({ user: (req as any).user?._id });
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get top destinations from API
// @route   GET /api/destinations/top
// @access  Public
const getTopDestinations = async (req: Request, res: Response) => {
    try {
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR || 'tripadvisor16.p.rapidapi.com'}/api/v1/hotels/searchLocation`,
            params: {
                query: 'popular destinations',
                limit: '6',
                currency: 'USD',
                sort: 'relevance',
                lang: 'en_US'
            },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR || 'tripadvisor16.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);

        if (response.data && response.data.data && response.data.data.length > 0) {
            const validData = response.data.data
                .map((item: any) => ({
                    name: item.title?.replace(/<\/?b>/g, '') || item.name || 'Unknown Destination',
                    location_string: item.secondaryText || item.location_string || 'Global',
                    rating: item.rating || (4 + Math.random()).toFixed(1),
                    photo: {
                        images: {
                            large: {
                                url: item.photo?.images?.large?.url || item.photo?.images?.original?.url || `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80`
                            }
                        }
                    }
                }));

            if (validData.length > 0) {
                return res.json({ data: validData });
            }
        }

        // Fallback for demo
        const fallbackData = [
            { name: "Paris, France", location_string: "Europe", rating: "4.8", photo: { images: { large: { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800" } } } },
            { name: "Tokyo, Japan", location_string: "Asia", rating: "4.9", photo: { images: { large: { url: "https://images.unsplash.com/photo-1540959733332-e94e270b2d42?w=800" } } } },
            { name: "New York, USA", location_string: "North America", rating: "4.7", photo: { images: { large: { url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800" } } } }
        ];
        res.json({ data: fallbackData });

    } catch (error: any) {
        console.error('API Error:', error.message);
        const fallbackData = [
            { name: "Paris, France", location_string: "Europe", rating: "4.8", photo: { images: { large: { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800" } } } },
            { name: "Tokyo, Japan", location_string: "Asia", rating: "4.9", photo: { images: { large: { url: "https://images.unsplash.com/photo-1540959733332-e94e270b2d42?w=800" } } } }
        ];
        res.json({ data: fallbackData });
    }
};

// @desc    Create a destination
// @route   POST /api/destinations
// @access  Private
const addDestination = async (req: Request, res: Response) => {
    const { place_id, name, address, lat, lng, notes } = req.body;

    if (!(req as any).user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const destination = new Destination({
            user: (req as any).user._id,
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

        if (!(req as any).user || destination.user.toString() !== (req as any).user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await destination.deleteOne();
        res.json({ message: 'Destination removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getDestinations, getTopDestinations, addDestination, deleteDestination };
