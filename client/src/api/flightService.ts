import api from './api';

const BASE_URL = '/flights';

export const searchFlights = async (searchParams: any) => {
    // searchParams: { from, to, date, adults, children, infants, cabinClass, currency }
    const response = await api.get(`${BASE_URL}/search`, { params: searchParams });
    return response.data;
};
