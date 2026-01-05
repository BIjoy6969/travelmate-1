import axios from "axios";

/**
 * API Base URL Configuration
 * - VITE_API_URL: Use this for production (e.g. Render backend)
 * - VITE_API_PORT: Optional override for local port (default 5000)
 * - Fallback: localhost:5000/api in dev, /api in prod if proxied
 */
const API_PORT = import.meta.env.VITE_API_PORT || 5000;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? `http://localhost:5000/api` : `/api`);

// Demo user id removed as JWT is now implemented

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --------------------
// Helpers
// --------------------
const openInNewTab = (url) => {
  // safer open
  window.open(url, "_blank", "noopener,noreferrer");
};

// --------------------
// Member-4 services
// --------------------
export const weatherService = {
  getWeather: (city) => api.get(`/weather`, { params: { city } }),
};

export const currencyService = {
  /**
   * Generic convert
   */
  convert: (base, target, amount) =>
    api.get(`/currency`, { params: { base, target, amount } }),

  /**
   * Demo-friendly: always convert selected currency to BDT
   * (fits your requirement: show conversion rate to Taka + converted amount)
   */
  convertToBDT: (base, amount = 1) =>
    api.get(`/currency`, { params: { base, target: "BDT", amount } }),
};

export const dashboardService = {
  /**
   * Supports both patterns:
   * - getDashboard(city, base, target)  (your current usage)
   * - getDashboard({ city, base, target, userId }) (new flexible usage)
   */
  getDashboard: (arg1, base = "USD", target = "BDT") => {
    // If called with an object
    if (typeof arg1 === "object" && arg1 !== null) {
      const {
        city = "Dhaka",
        base: b = "USD",
        target: t = "BDT",
      } = arg1;
      return api.get(`/dashboard`, { params: { city, base: b, target: t } });
    }

    // If called with (city, base, target)
    const city = arg1 || "Dhaka";
    return api.get(`/dashboard`, { params: { city, base, target } });
  },
};

export const exportService = {
  /**
   * Quick report (works even without trips/login):
   * Fetches a PDF as a blob (with auth headers) and triggers a browser download.
   */
  exportPDF: async ({
    tripId,
    city = "Dhaka",
    base = "USD",
    target = "BDT",
    amount = 1,
  } = {}) => {
    try {
      const params = new URLSearchParams();
      if (tripId) params.set("tripId", tripId);
      if (city) params.set("city", city);
      if (base) params.set("base", base);
      if (target) params.set("target", target);
      if (amount != null) params.set("amount", String(amount));

      const response = await api.get(`/export/pdf`, {
        params,
        responseType: "blob",
      });

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `travelmate-report-${tripId || 'dashboard'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    }
  },
};

// --------------------
// Other module services
// (kept so the whole app still runs)
// These match existing page usage: getAll/create/update/delete
// --------------------
export const tripService = {
  getAll: () => api.get(`/trips`),
  getById: (id) => api.get(`/trips/${id}`),

  create: (payload) => api.post(`/trips`, payload),

  update: (id, payload) => api.put(`/trips/${id}`, payload),

  delete: (id) => api.delete(`/trips/${id}`),
};

export const expenseService = {
  getAll: (tripId) =>
    api.get(`/expenses`, { params: { tripId } }),

  getById: (id) =>
    api.get(`/expenses/${id}`),

  create: (payload) =>
    api.post(`/expenses`, payload),

  update: (id, payload) => api.put(`/expenses/${id}`, payload),

  delete: (id) =>
    api.delete(`/expenses/${id}`),
};

export const flightService = {
  search: (from, to, date) =>
    api.get(`/flights/search`, { params: { from, to, date } }),

  book: (payload) => api.post(`/flights/book`, payload),

  bookings: () =>
    api.get(`/flights/bookings`),

  cancel: (bookingId) => api.delete(`/flights/bookings/${bookingId}`),

  getAll: () => api.get(`/flights`),
  getById: (id) => api.get(`/flights/${id}`),
  create: (payload) => api.post(`/flights`, payload),
  update: (id, payload) => api.put(`/flights/${id}`, payload),
  delete: (id) => api.delete(`/flights/${id}`),
};

export const favoritesService = {
  getAll: () => api.get(`/favorites`),
  add: (payload) => api.post(`/favorites`, payload),
  remove: (id) => api.delete(`/favorites/${id}`),
  update: (id, payload) => api.put(`/favorites/${id}`, payload),
  updateNotes: (id, notes) => api.patch(`/favorites/${id}`, { notes }),
};

export const reviewService = {
  getByDestination: (destinationId) => api.get(`/reviews/${destinationId}`),
  getStats: (destinationId) => api.get(`/reviews/${destinationId}/stats`),
  add: (payload) => api.post(`/reviews`, payload),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const uploadService = {
  uploadImage: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const bookingService = {
  create: (payload) => api.post(`/bookings`, payload),
  getAll: () => api.get(`/bookings`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export const destinationService = {
  getAll: () => api.get(`/destinations`),
  getTrending: (params) => api.get(`/destinations`, { params }),
};

export const hotelService = {
  search: (params) => api.get(`/hotels/search`, { params }),
};

export const authService = {
  getProfile: () => api.get(`/auth/profile`),
  updateProfile: (data) => api.put(`/auth/profile`, data),
  updatePassword: (data) => api.put(`/auth/password`, data),
};

export const budgetService = {
  getAll: () => api.get(`/budget`),
  getByTrip: (destination) => api.get(`/budget/trip/${destination}`),
  create: (payload) => api.post(`/budget`, payload),
  update: (id, payload) => api.put(`/budget/${id}`, payload),
  generate: (payload) => api.post(`/budget/generate`, payload),
  addExpense: (payload) => api.post(`/budget/expenses`, payload),
  deleteExpense: (expenseId) => api.delete(`/budget/expenses/${expenseId}`),
};

export const chatService = {
  sendMessage: (message, history) => api.post(`/chat`, { message, history }),
};

export const itineraryService = {
  generate: (payload) => api.post(`/itinerary`, payload),
};

export default api;
