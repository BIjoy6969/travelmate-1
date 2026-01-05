const express = require('express');
const axios = require('axios');
const router = express.Router();

// Mock data in case API key is missing or limit reached (for demonstration/dev purposes)
const mockDestinations = [
    {
        location_id: "1",
        name: "Paris, France",
        address: "Paris, Île-de-France, France",
        rating: "4.5",
        num_reviews: "12000",
        photo: {
            images: {
                large: {
                    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
                }
            }
        },
        description: "The City of Light draws millions of visitors every year with its unforgettable ambiance."
    },
    {
        location_id: "2",
        name: "Kyoto, Japan",
        address: "Kyoto, Kyoto Prefecture, Japan",
        rating: "5.0",
        num_reviews: "8500",
        photo: {
            images: {
                large: {
                    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop"
                }
            }
        },
        description: "Kyoto is famous for its classical Buddhist temples, gardens, imperial palaces, Shinto shrines and traditional wooden houses."
    },
    {
        location_id: "3",
        name: "Santorini, Greece",
        address: "Santorini, Cyclades, Greece",
        rating: "4.8",
        num_reviews: "6000",
        photo: {
            images: {
                large: {
                    url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2029&auto=format&fit=crop"
                }
            }
        },
        description: "One of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC."
    },
    {
        location_id: "4",
        name: "Machu Picchu, Peru",
        address: "Machu Picchu, Peru",
        rating: "5.0",
        num_reviews: "15000",
        photo: {
            images: {
                large: {
                    url: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2070&auto=format&fit=crop"
                }
            }
        },
        description: "A 15th-century Inca citadel, located in the Eastern Cordillera of southern Peru, on a 2,430-metre mountain ridge."
    }
];

// Get top destinations
router.get('/', async (req, res) => {
    try {
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        const rapidApiHost = process.env.RAPIDAPI_HOST || 'travel-advisor.p.rapidapi.com';

        if (!rapidApiKey) {
            console.log("RAPIDAPI_KEY not found. Returning mock data.");
            return res.json({ data: mockDestinations });
        }

        const options = {
            method: 'GET',
            url: `https://${rapidApiHost}/locations/search`,
            params: {
                query: 'popular',
                limit: '10',
                offset: '0',
                units: 'km',
                location_id: '1',
                currency: 'USD',
                sort: 'relevance',
                lang: 'en_US'
            },
            headers: {
                'x-rapidapi-key': rapidApiKey,
                'x-rapidapi-host': rapidApiHost
            }
        };

        const response = await axios.request(options);

        // Transform the data slightly if needed, or just return it
        // The structure varies by API, but usually response.data.data contains the list
        if (response.data && response.data.data) {
            res.json({ data: response.data.data });
        } else {
            res.json({ data: mockDestinations });
        }

    } catch (error) {
        console.error("Error fetching destinations:", error.message);
        // Fallback to mock data on error so the UI still works
        res.json({ data: mockDestinations });
    }
});

module.exports = router;
