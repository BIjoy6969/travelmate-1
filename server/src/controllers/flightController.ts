import { Request, Response } from 'express';
import axios from 'axios';

export const searchFlights = async (req: Request, res: Response): Promise<void> => {
    try {
        const { from, to, date, adults = 1, children = 0, infants = 0, cabinClass = 'Economy', currency = 'USD' } = req.query;

        if (!from || !to || !date) {
            res.status(400).json({ message: 'Missing required query parameters: from, to, date' });
            return;
        }

        const apiKey = process.env.FLIGHT_API_KEY;
        if (!apiKey) {
            res.status(500).json({ message: 'Flight API Key not configured' });
            return;
        }

        // URL Structure: https://api.flightapi.io/onewaytrip/{api_key}/{from}/{to}/{date}/{adults}/{children}/{infants}/{cabin_class}/{currency}
        const url = `https://api.flightapi.io/onewaytrip/${apiKey}/${from}/${to}/${date}/${adults}/${children}/${infants}/${cabinClass}/${currency}`;

        console.log(`Fetching flights from: ${url}`); // specific log for debugging

        const response = await axios.get(url);
        const data = response.data;

        // Transform normalized data
        const legsMap = new Map(data.legs.map((leg: any) => [leg.id, leg]));
        const carriersMap = new Map(data.carriers.map((carrier: any) => [carrier.id, carrier]));
        const placesMap = new Map(data.places.map((place: any) => [place.id, place]));
        const segmentsMap = new Map(data.segments.map((segment: any) => [segment.id, segment]));

        const flights = data.itineraries.map((itinerary: any) => {
            const legId = itinerary.leg_ids[0];
            const leg = legsMap.get(legId) as any;

            if (!leg) return null;

            // Get segments to find carrier
            const segmentIds = leg.segment_ids;
            const carrierNames = segmentIds.map((segId: string) => {
                const segment = segmentsMap.get(segId) as any;
                const carrierId = segment?.marketing_carrier_id || segment?.operating_carrier_id;
                return (carriersMap.get(carrierId) as any)?.name || 'Unknown Airline';
            });
            const uniqueCarriers = [...new Set(carrierNames)].join(', ');

            // Get places
            const origin = placesMap.get(leg.origin_place_id) as any;
            const destination = placesMap.get(leg.destination_place_id) as any;

            // Pricing
            const pricingOption = itinerary.pricing_options[0];
            const price = pricingOption?.price?.amount;
            const deepLink = pricingOption?.items[0]?.url;

            // Duration format (minutes to readable)
            const durationMins = leg.duration;
            const hours = Math.floor(durationMins / 60);
            const mins = durationMins % 60;
            const durationStr = `${hours}h ${mins}m`;

            return {
                id: itinerary.id,
                price,
                currency,
                deepLink,
                airline: uniqueCarriers,
                departureTime: leg.departure,
                arrivalTime: leg.arrival,
                duration: durationStr,
                stops: leg.stop_count,
                origin: origin?.display_code || origin?.name || from,
                destination: destination?.display_code || destination?.name || to,
                segments: segmentIds.length
            };
        }).filter((flight: any) => flight !== null);

        res.json(flights);
    } catch (error: any) {
        console.error('Error fetching flights:', error.message);
        if (error.response) {
            console.error('API Error Data:', JSON.stringify(error.response.data, null, 2));
            console.error('API Error Status:', error.response.status);

            let message = 'External API Error';
            let detail = error.response.data;

            // Handle generic "something went wrong" from external API which usually means invalid IATA code
            if (detail?.message === 'something went wrong, please try again') {
                message = 'Invalid Airport Code (IATA) or API Error. Please check your inputs.';
                detail.message = message;
            }

            res.status(error.response.status || 500).json({
                message,
                detail
            });
            return;
        }
        res.status(500).json({ message: 'Failed to fetch flight data', error: error.message });
    }
};
