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
  (import.meta.env.DEV ? `http://localhost:${API_PORT}/api` : `/api`);

/**
 * Demo user id (no-login mode)
 * Use a valid 24-hex Mongo ObjectId.
 */
export const DEMO_USER_ID =
  import.meta.env.VITE_DEMO_USER_ID || "000000000000000000000001";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

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
        userId = DEMO_USER_ID,
      } = arg1;
      return api.get(`/dashboard`, { params: { city, base: b, target: t, userId } });
    }

    // If called with (city, base, target)
    const city = arg1 || "Dhaka";
    return api.get(`/dashboard`, { params: { city, base, target, userId: DEMO_USER_ID } });
  },
};

export const exportService = {
  /**
   * Quick report (works even without trips/login):
   * Opens a PDF in a new tab including Weather + Currency + optional Trip section.
   */
  exportPDF: ({
    tripId,
    city = "Dhaka",
    base = "USD",
    target = "BDT",
    amount = 1,
    userId = DEMO_USER_ID,
  } = {}) => {
    const params = new URLSearchParams();
    if (tripId) params.set("tripId", tripId);
    if (city) params.set("city", city);
    if (base) params.set("base", base);
    if (target) params.set("target", target);
    if (amount != null) params.set("amount", String(amount));
    if (userId) params.set("userId", userId);

    openInNewTab(`${API_BASE_URL}/export/pdf?${params.toString()}`);
  },
};

// --------------------
// Other module services
// (kept so the whole app still runs)
// These match existing page usage: getAll/create/update/delete
// --------------------
export const tripService = {
  getAll: (userId = DEMO_USER_ID) => api.get(`/trips`, { params: { userId } }),
  getById: (id) => api.get(`/trips/${id}`),

  create: (payload) => api.post(`/trips`, { userId: DEMO_USER_ID, ...payload }),

  update: (id, payload) => api.put(`/trips/${id}`, payload),

  // ✅ FIXED DELETE (sends userId + fallback for different backend styles)
  delete: async (id, userId = DEMO_USER_ID) => {
    try {
      // Most common REST style: DELETE /trips/:id
      return await api.delete(`/trips/${id}`, { params: { userId } });
    } catch (err) {
      // Fallback style: DELETE /trips?id=...
      if (err?.response?.status === 404) {
        return await api.delete(`/trips`, { params: { id, userId } });
      }
      throw err;
    }
  },
};

export const expenseService = {
  getAll: (userId = DEMO_USER_ID, tripId) =>
    api.get(`/expenses`, { params: { userId, tripId } }),

  getById: (id, userId = DEMO_USER_ID) =>
    api.get(`/expenses/${id}`, { params: { userId } }),

  create: (payload) =>
    api.post(`/expenses`, { userId: DEMO_USER_ID, ...payload }),

  update: (id, payload) => api.put(`/expenses/${id}`, payload),

  // ✅ FIXED DELETE (sends userId to match your controller)
  delete: (id, userId = DEMO_USER_ID) =>
    api.delete(`/expenses/${id}`, { params: { userId } }),
};

export const flightService = {
  /**
   * If your project uses /flights/search + /flights/book, keep these:
   * (If not used, they won't hurt)
   */
  search: (from, to, date) =>
    api.get(`/flights/search`, { params: { from, to, date } }),

  book: (payload) => api.post(`/flights/book`, { userId: DEMO_USER_ID, ...payload }),

  bookings: (userId = DEMO_USER_ID) =>
    api.get(`/flights/bookings`, { params: { userId } }),

  cancel: (bookingId) => api.delete(`/flights/bookings/${bookingId}`),

  /**
   * Also keep classic CRUD routes if your existing Flights page uses them
   */
  getAll: (userId = DEMO_USER_ID) => api.get(`/flights`, { params: { userId } }),
  getById: (id) => api.get(`/flights/${id}`),
  create: (payload) => api.post(`/flights`, { userId: DEMO_USER_ID, ...payload }),
  update: (id, payload) => api.put(`/flights/${id}`, payload),
  delete: (id) => api.delete(`/flights/${id}`),
};

export default api;
