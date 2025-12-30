# TravelMate System Overview

### **1. High-Level Overview**
**TravelMate** is a full-stack web application designed to help users plan trips. It combines **search functionality** (using maps) with **AI-powered intelligence** (using Google Gemini) to generate itineraries and budgets.

### **2. Technology Stack**
*   **Frontend (Client side):**
    *   **React + Vite**: For building a fast, interactive user interface.
    *   **Tailwind CSS**: For modern, responsive styling.
    *   **React Router**: For navigation between pages (Home, Trip Planner).
    *   **Leaflet / React Leaflet**: For the interactive maps.
*   **Backend (Server side):**
    *   **Node.js & Express**: The web server handling API requests.
    *   **MongoDB & Mongoose**: The database for storing Favorites, Budgets, and potentially Reviews.
    *   **Cloudinary**: For hosting user-uploaded images.
    *   **Google Gemini AI SDK**: For generating chat responses, itineraries, and budget estimates.

---

### **3. Core System Architecture & Data Flow**

The system works in a clear **Client-Server** model:

#### **A. The User Journey (Frontend)**
1.  **Landing Page (`/`)**: Displays the value proposition and steps (Search -> Save -> AI Plan).
2.  **Trip Planner (`/planner`)**: This is the main dashboard.
    *   Users can **Search** for destinations.
    *   Users can **Save Favorites** (sends `POST` request to `/api/favorites`).
    *   Users can **Request AI Plans** (sends requests to `/api/chat` or similar).
3.  **Global AI Chat**: The `AIChat` component is always available, allowing users to ask travel advice at any time.

#### **B. The API Layer (Backend)**
The `server.js` file is the entry point. It connects to MongoDB and sets up these key routes:
*   `/api/favorites` → Manages saving/deleting favorite destinations.
*   `/api/budget` → Handles budget calculations.
*   `/api/chat` → **The AI Brain**.
*   `/api/reviews` → Manages user reviews.
*   `/api/upload` → Handles image uploads via Cloudinary.

#### **C. The AI Integration (The "Smart" Part)**
*   When a user talks to the chatbot or requests a plan, the frontend sends the message to `/api/chat`.
*   The backend receives this, initializes the **Google Gemini Pro (gemini-2.5-flash)** model, and sends the prompt.
*   The AI generates a response (text, itinerary, or budget breakdown), which is sent back to the frontend to be displayed.

### **4. Key Features**
*   **AI-Powered Chat**: Uses the latest Gemini 2.5 flash model for fast, natural conversation.
*   **Persistent Data**: Favorites and saved plans are stored in MongoDB (using Mongoose schemas).
*   **Image Management**: Uses Cloudinary to handle file uploads efficiently.

### **Summary Schema for Viva**
> "The user interacts with the **React Frontend**. When they perform an action (like asking the AI a question), the frontend sends an HTTP request to our **Express Backend**. The backend communicates with **MongoDB** for data and **Google Gemini** for intelligence before returning the final result to the user."
