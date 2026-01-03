const axios = require('axios');

exports.getTopDestinations = async (req, res) => {
    try {
        // Switch back to Travel Advisor since user has a valid subscription for it (proven by Hotel logs)
        // and the other API gave 429 Quota Exceeded.
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`,
            params: {
                query: 'popular destinations',
                limit: '6',
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

        if (response.data && response.data.data && response.data.data.length > 0) {
            const validData = response.data.data
                .map(item => item.result_object || item) // Handle 'result_object' wrapper
                .filter(item => item.name && item.photo) // Ensure it has a name and photo
                .map(item => ({
                    name: item.name,
                    location_string: item.location_string || item.address_obj?.address_string || 'Unknown Location',
                    rating: item.rating || 'N/A',
                    photo: {
                        images: {
                            large: {
                                // Use large or original or medium, fallbacks
                                url: item.photo.images.large?.url || item.photo.images.original?.url || item.photo.images.medium?.url
                            }
                        }
                    }
                }));

            if (validData.length > 0) {
                return res.json({ data: validData });
            }
        }

        // If API returns nothing, send 404
        console.log('Top Destinations: No data found after filtering.');
        res.status(404).json({ message: 'No destinations found from API' });

    } catch (error) {
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
            return res.status(error.response.status).json({
                message: 'External API Error',
                details: error.response.data
            });
        }
        res.status(500).json({ message: 'Server Error fetching destinations', error: error.message });
    }
};
