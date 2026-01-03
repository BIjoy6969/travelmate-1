import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TripsPage from './pages/TripsPage';
import ExploreDestinations from './pages/ExploreDestinations';
import FavoritesPage from './pages/FavoritesPage';
import BudgetTracker from './pages/BudgetTracker';
import AIChat from './pages/AIChat';
import WeatherPage from './pages/WeatherPage';
import FlightsPage from './pages/FlightsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ItineraryGenerator from './pages/ItineraryGenerator';
import HotelSearch from './pages/HotelSearch';
import BookingHistory from './pages/BookingHistory';
import Currency from './pages/Currency';
import Expenses from './pages/Expenses';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/trips" element={<TripsPage />} />
                    <Route path="/explore" element={<ExploreDestinations />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/budget" element={<BudgetTracker />} />
                    <Route path="/chat" element={<AIChat />} />
                    <Route path="/weather" element={<WeatherPage />} />
                    <Route path="/flights" element={<FlightsPage />} />
                    <Route path="/itinerary" element={<ItineraryGenerator />} />
                    <Route path="/hotels" element={<HotelSearch />} />
                    <Route path="/bookings" element={<BookingHistory />} />
                    <Route path="/currency" element={<Currency />} />
                    <Route path="/expenses" element={<Expenses />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
