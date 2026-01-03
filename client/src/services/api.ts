import axios from "axios";

const API_BASE_URL = "http://localhost:1340/api";

export const DEMO_USER_ID = "000000000000000000000001";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const setAccessToken = (token: string) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
};

export const weatherService = {
    getWeather: (city: string) => api.get(`/weather`, { params: { city } }),
};

export const currencyService = {
    convert: (base: string, target: string, amount: number) =>
        api.get(`/currency/convert`, { params: { base, target, amount } }),
};

export const dashboardService = {
    getDashboard: (params: { city?: string; base?: string; target?: string; userId?: string }) => {
        return api.get(`/dashboard`, { params });
    },
};

export const exportService = {
    exportPDF: (params: {
        tripId?: string;
        city?: string;
        base?: string;
        target?: string;
        amount?: number;
        userId?: string;
    } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.tripId) queryParams.set("tripId", params.tripId);
        if (params.city) queryParams.set("city", params.city);
        if (params.base) queryParams.set("base", params.base);
        if (params.target) queryParams.set("target", params.target);
        if (params.amount != null) queryParams.set("amount", String(params.amount));
        if (params.userId) queryParams.set("userId", params.userId);

        openInNewTab(`${API_BASE_URL}/export/pdf?${queryParams.toString()}`);
    },
};

export const tripService = {
    getAll: (userId: string = DEMO_USER_ID) => api.get(`/trips`, { params: { userId } }),
    getById: (id: string, userId: string = DEMO_USER_ID) => api.get(`/trips/${id}`, { params: { userId } }),
    create: (payload: any) => api.post(`/trips`, { userId: DEMO_USER_ID, ...payload }),
    update: (id: string, payload: any, userId: string = DEMO_USER_ID) => api.put(`/trips/${id}`, payload, { params: { userId } }),
    delete: (id: string, userId: string = DEMO_USER_ID) => api.delete(`/trips/${id}`, { params: { userId } }),
};

export const expenseService = {
    getAll: (userId: string = DEMO_USER_ID, tripId?: string) =>
        api.get(`/expenses`, { params: { userId, tripId } }),
    create: (payload: any) =>
        api.post(`/expenses`, { userId: DEMO_USER_ID, ...payload }),
    update: (id: string, payload: any, userId: string = DEMO_USER_ID) => api.put(`/expenses/${id}`, payload, { params: { userId } }),
    delete: (id: string, userId: string = DEMO_USER_ID) =>
        api.delete(`/expenses/${id}`, { params: { userId } }),
};

export const flightService = {
    getAll: (userId: string = DEMO_USER_ID) => api.get(`/flights`, { params: { userId } }),
    create: (payload: any) => api.post(`/flights`, { userId: DEMO_USER_ID, ...payload }),
    delete: (id: string) => api.delete(`/flights/${id}`),
    search: (params: any) => api.get(`/flights/search`, { params }),
};

export const bookingService = {
    getAll: (userId: string = DEMO_USER_ID) => api.get(`/bookings`, { params: { userId } }),
    getByUser: (userId: string = DEMO_USER_ID) => api.get(`/bookings/${userId}`),
    create: (payload: any) => api.post(`/bookings`, payload),
    update: (id: string, payload: any) => api.put(`/bookings/${id}`, payload),
    cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
    delete: (id: string) => api.delete(`/bookings/${id}`),
};

export default api;
