import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Send cookies
});

let accessToken = '';

export const setAccessToken = (token: string) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await api.post('/auth/refresh');
                const newAccessToken = data.accessToken;
                setAccessToken(newAccessToken);
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                // Refresh failed, user needs to login
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
