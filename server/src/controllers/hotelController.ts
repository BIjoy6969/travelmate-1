import { Request, Response } from 'express';
import axios from 'axios';

export const searchHotels = async (req: Request, res: Response): Promise<void> => {
    const { location } = req.query;

    if (!location) {
        res.status(400).json({ message: 'Location is required' });
        return;
    }

    try {
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR || 'tripadvisor16.p.rapidapi.com'}/api/v1/hotels/searchLocation`,
            params: { query: location, limit: '5', currency: 'USD', sort: 'relevance', lang: 'en_US' },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR || 'tripadvisor16.p.rapidapi.com'
            }
        };

        let response = await axios.request(options);

        if (!response.data || !response.data.data || response.data.data.length === 0) {
            options.params.query = location as string;
            response = await axios.request(options);
        }

        if (response.data && response.data.data && response.data.data.length > 0) {
            const apiHotels = response.data.data
                .map((item: any) => ({
                    hotel_id: item.geoId || item.location_id || item.documentId,
                    hotel_name: item.title?.replace(/<\/?b>/g, '') || item.name || 'Unknown Hotel',
                    address: item.secondaryText || item.address_obj?.address_string || (location as string),
                    class: item.rating ? Math.round(parseFloat(item.rating)) : 4,
                    min_total_price: 100 + Math.floor(Math.random() * 200),
                    currency_code: 'USD',
                    main_photo_url: item.photo?.images?.large?.url || item.photo?.images?.original?.url || 'https://via.placeholder.com/300x200'
                }));

            if (apiHotels.length > 0) {
                res.json(apiHotels);
                return;
            }
        }

        res.status(404).json({ message: 'No hotels found' });

    } catch (error: any) {
        console.error('Hotel API Error:', error.message);
        res.status(500).json({ message: 'Error fetching hotels', error: error.message });
    }
};
