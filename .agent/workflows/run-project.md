---
description: how to run the travelmate application
---
# Running TravelMate

Follow these steps to set up and run the project locally.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed (v18+ recommended).
- **MongoDB**: You need a running MongoDB instance (Local or Atlas).

## 1. Install Dependencies
In the root directory, run the following command to install dependencies for the root, client, and server:
// turbo
```bash
npm run install-all
```

## 2. Environment Configuration
Navigate to the `server/` directory and create/edit the `.env` file. Ensure the following variables are set:
- `MONGO_URI`: Your MongoDB connection string.
- `GEMINI_API_KEY`: Google Gemini API key for AI features.
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key.
- `RAPIDAPI_KEY`: RapidAPI key for Destinations and Hotels.
- `RAPIDAPI_HOST_TRIPADVISOR`: `tripadvisor16.p.rapidapi.com`

## 3. Run the Application
From the root directory, start both the frontend and backend servers concurrently:
// turbo
```bash
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: Accessible via `/api` (Proxied in development)
