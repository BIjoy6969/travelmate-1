# Travelmate

A full-stack application for saving your favorite travel destinations, built with Node.js, React, MongoDB, and TypeScript.

## Features

- **Authentication**: Secure JWT-based auth with HttpOnly refresh tokens.
- **Save Destinations**: Search and save places using Google Maps Autocomplete.
- **Dashboard**: View your saved list with details.
- **Responsive UI**: Modern interface with specific design aesthetics.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Infrastructure**: Docker, Docker Compose

## Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Google Maps API Key (Places API enabled)

## Setup & Running

### 1. Environment Variables

**Backend** (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://mongo:27017/travelmate
JWT_SECRET=supersecret123
JWT_REFRESH_SECRET=superrefreshsecret123
```

**Frontend** (`client/.env`):
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. Run with Docker (Recommended)

```bash
docker-compose up --build
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: Accessible via `/api` (Proxied in development)

### 3. Run Locally

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## Seeding Data

To seed a demo user:

```bash
cd server
npm run seed
```

**Demo Credentials**:
- Email: `demo@example.com`
- Password: `Demo123!`

## API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/destinations` - Get saved places
- `POST /api/destinations` - Save a place
- `DELETE /api/destinations/:id` - Remove a place

## Testing

Run backend tests:

```bash
cd server
npm test
```
