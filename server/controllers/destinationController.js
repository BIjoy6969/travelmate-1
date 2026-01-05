const axios = require('axios');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');

exports.getTopDestinations = async (req, res) => {
    try {
        const { type, page = 1, limit = 10, sortBy = 'saves' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitVal = parseInt(limit);

        // --- Community Favorites Data ---
        const fetchCommunity = async () => {
            const pipeline = [
                {
                    $group: {
                        _id: "$destinationId",
                        count: { $sum: 1 },
                        name: { $first: "$name" },
                        location: { $first: "$location" },
                        image: { $first: "$image" },
                        lat: { $first: "$lat" },
                        lng: { $first: "$lng" }
                    }
                },
                // Join with reviews to get ratings
                {
                    $lookup: {
                        from: "reviews",
                        localField: "_id",
                        foreignField: "destinationId",
                        as: "reviews"
                    }
                },
                {
                    $addFields: {
                        avgRating: { $avg: "$reviews.rating" }
                    }
                }
            ];

            // Apply sorting
            if (sortBy === 'stars') {
                pipeline.push({ $sort: { avgRating: -1, count: -1 } });
            } else {
                pipeline.push({ $sort: { count: -1, avgRating: -1 } });
            }

            pipeline.push({ $skip: skip });
            pipeline.push({ $limit: limitVal });

            const communityFavorites = await Favorite.aggregate(pipeline);

            return communityFavorites.map(fav => ({
                name: fav.name,
                location_id: fav._id,
                location_string: fav.location,
                latitude: fav.lat,
                longitude: fav.lng,
                rating: fav.avgRating ? fav.avgRating.toFixed(1) : '4.5',
                saves: fav.count,
                source: 'Community',
                photo: { images: { large: { url: fav.image } } }
            }));
        };

        // --- Global Trends Data ---
        const fetchGlobal = async () => {
            try {
                const options = {
                    method: 'GET',
                    url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`,
                    params: {
                        query: 'popular destinations',
                        limit: limitVal.toString(),
                        offset: skip.toString(),
                        currency: 'USD',
                        sort: 'relevance',
                        lang: 'en_US'
                    },
                    headers: {
                        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                        'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR
                    }
                };

                const response = await axios.request(options);
                if (response.data && response.data.data) {
                    return response.data.data
                        .map(item => item.result_object || item)
                        .filter(item => item.name && item.photo)
                        .map(item => ({
                            name: item.name,
                            location_id: item.location_id,
                            location_string: item.location_string || item.address_obj?.address_string || 'Global',
                            latitude: item.latitude,
                            longitude: item.longitude,
                            rating: item.rating || (4 + Math.random()).toFixed(1),
                            source: 'Global',
                            photo: {
                                images: {
                                    large: {
                                        url: item.photo.images.large?.url || item.photo.images.original?.url || item.photo.images.medium?.url
                                    }
                                }
                            }
                        }));
                }
                return [];
            } catch (err) {
                console.error("Global fetch error:", err.message);
                return [];
            }
        };

        if (type === 'community') {
            const data = await fetchCommunity();
            return res.json({ data });
        } else if (type === 'global') {
            const data = await fetchGlobal();
            return res.json({ data });
        } else {
            // Default mixed behavior (Home Page)
            // For mixed, we ignore pagination and just return the top few of each
            const community = await fetchCommunity();
            const global = await fetchGlobal();
            return res.json({
                data: {
                    community: community.slice(0, 3),
                    global: global.slice(0, 3)
                }
            });
        }

    } catch (error) {
        console.error('Unified Destinations API Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
