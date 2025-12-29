import api from './api';

const BASE_URL = '/trips';

export const createTrip = async (tripData: any) => {
    const response = await api.post(BASE_URL, tripData);
    return response.data;
};

export const getTrips = async () => {
    const response = await api.get(BASE_URL);
    return response.data;
};

export const updateTrip = async (id: string, tripData: any) => {
    const response = await api.put(`${BASE_URL}/${id}`, tripData);
    return response.data;
};

export const deleteTrip = async (id: string) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
};
