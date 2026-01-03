const axios = require('axios');

exports.searchHotels = async (req, res) => {
    const { location } = req.query;

    try {
        // Attempt 1: Specific query
        let query = `hotels in ${location}`;
        let options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`,
            params: { query, limit: '5', currency: 'USD', sort: 'relevance', lang: 'en_US' },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR
            }
        };

        let response = await axios.request(options);

        // Attempt 2: Broad query if specific failed
        if (!response.data || !response.data.data || response.data.data.length === 0) {
            console.log(`Specific query "${query}" failed. Trying broad query "${location}"...`);
            options.params.query = location;
            response = await axios.request(options);
        }

        if (response.data && response.data.data && response.data.data.length > 0) {
            const apiHotels = response.data.data
                .map(item => item.result_object || item) // Handle wrapper if present
                .filter(item => item.name)
                .map(item => ({
                    hotel_id: item.location_id,
                    hotel_name: item.name,
                    address: item.address_obj ? item.address_obj.address_string : location,
                    class: item.rating ? Math.round(parseFloat(item.rating)) : 4,
                    min_total_price: 100 + Math.floor(Math.random() * 200), // Mock price
                    currency_code: 'USD',
                    main_photo_url: item.photo?.images?.large?.url || item.photo?.images?.original?.url || 'https://via.placeholder.com/300x200'
                }));

            if (apiHotels.length > 0) {
                return res.json(apiHotels);
            }
        }

        console.log('API Response (No Data):', JSON.stringify(response.data));
        res.status(404).json({ message: 'No hotels or locations found for this query' });

    } catch (error) {
        console.error('Hotel API Error:', error.message);
        if (error.response) {
            console.error('API Status:', error.response.status);
            console.error('API Data:', JSON.stringify(error.response.data));
            return res.status(error.response.status).json({
                message: 'External API Error',
                details: error.response.data
            });
        }
        res.status(500).json({ message: 'Error fetching hotels', error: error.message });
    }
};
