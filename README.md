# TravelMate 🌍✈️

TravelMate is a comprehensive MERN stack travel planning application designed to assist users in discovering destinations, managing budgets, and organizing trips with the help of AI.

## Project Overview

This project is divided into three key modules, developed collaboratively:

*   **Module 1: User & Destination Management**
    *   Authentication (Login/Signup)
    *   Explore Destinations (Reviews, Weather)
    *   **Favorites Management** (Saves destinations with personal notes)
*   **Module 2: Trip & Budget Planning**
    *   Trip Itinerary Creation
    *   **Budget Tracker** (Expense logging, Visualization, Daily Limit Calculator)
    *   Currency Conversion
*   **Module 3: Flight, Hotel & Support**
    *   Booking Systems
    *   **AI Travel Assistant** (Context-aware Chatbot using Gemini API)
    *   **Reviews & Ratings** (Multi-category feedback system)

## Progress Status

### ✅ Member 3 Features (Completed)

1.  **Favorites with Notes**
    *   Users can save favorite destinations.
    *   Added ability to attach personal notes to saved locations.
2.  **Premium Budget Tracker**
    *   Full expense tracking capability.
    *   **Visual Analytics**: Interactive Pie Chart breakdown.
    *   **Smart Calc**: "Safe-to-Spend" daily limit based on trip duration.
3.  **AI Travel Assistant**
    *   Integrated **Google Gemini 2.0 Flash / Latest** model.
    *   **Context-Aware**: The AI knows your current budget and saved favorites to give personalized advice.
4.  **Advanced Reviews**
    *   Implemented detailed rating system (Cleanliness, Service, Location, Value).

## Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide React, Recharts
*   **Backend**: Node.js, Express, Mongoose
*   **AI**: Google Gemini API
*   **Database**: MongoDB

## Setup

1.  Clone repository.
2.  Install dependencies: `npm install` in both `/client` and `/server`.
3.  Set up `.env` in `/server` with `MONGO_URI` and `GEMINI_API_KEY`.
4.  Run Backend: `npm start` (Port 5000).
5.  Run Frontend: `npm run dev` (Port 5173).
