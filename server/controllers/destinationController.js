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
        // Fallback to demo data if no specific API response error
        console.error('Destinations API Error - Falling back to demo data:', error.message);
        const demoDestinations = [
            {
                location_id: '1',
                name: 'Cox\'s Bazar',
                location: 'Chittagong Division, Bangladesh',
                image: 'https://images.unsplash.com/photo-1583323755498-8fec00109968?auto=format&fit=crop&q=80&w=800',
                rating: '4.8'
            },
            {
                location_id: '2',
                name: 'Paris',
                location: 'Ile-de-France, France',
                image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
                rating: '4.9'
            },
            {
                location_id: '3',
                name: 'Bali',
                location: 'Indonesia',
                image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
                rating: '4.7'
            }
        ];
        res.json({ data: demoDestinations });
    }
};
