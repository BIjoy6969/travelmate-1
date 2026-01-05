import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

// Components
import Navigation from './components/Navigation';
import AIChat from './components/AIChat';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import FavoritesPage from './pages/FavoritesPage';
import Home from './pages/Home';
import ItineraryGenerator from './pages/ItineraryGenerator';
import HotelSearch from './pages/HotelSearch';
import BookingHistory from './pages/BookingHistory';
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Expenses from "./pages/Expenses";
import Flights from "./pages/Flights";
import Weather from "./pages/Weather";
import Currency from "./pages/Currency";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import BudgetTracker from "./pages/BudgetTracker";

import { Sparkles, LayoutDashboard, MapPin, Heart } from 'lucide-react';
import './App.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center">
          <h1 className="text-xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-minimal-muted mt-2">Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <div className="app-container min-h-screen bg-minimal-bg flex flex-col">
        <Navigation />

        <main className="flex-grow animate-in-faded">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<ErrorBoundary><ProtectedRoute><Dashboard /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/planner" element={<ErrorBoundary><ProtectedRoute><FavoritesPage /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/favorites" element={<ErrorBoundary><ProtectedRoute><FavoritesPage /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/itinerary" element={<ErrorBoundary><ProtectedRoute><ItineraryGenerator /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/hotels" element={<ErrorBoundary><ProtectedRoute><HotelSearch /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/bookings" element={<ErrorBoundary><ProtectedRoute><BookingHistory /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/trips" element={<ErrorBoundary><ProtectedRoute><Trips /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/expenses" element={<ErrorBoundary><ProtectedRoute><Expenses /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/flights" element={<ErrorBoundary><ProtectedRoute><Flights /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/weather" element={<ErrorBoundary><ProtectedRoute><Weather /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/currency" element={<ErrorBoundary><ProtectedRoute><Currency /></ProtectedRoute></ErrorBoundary>} />

            <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
            <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
            <Route path="/profile" element={<ErrorBoundary><ProtectedRoute><Profile /></ProtectedRoute></ErrorBoundary>} />
            <Route path="/budget" element={<ErrorBoundary><ProtectedRoute><BudgetTracker /></ProtectedRoute></ErrorBoundary>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="py-12 border-t border-minimal-border text-center">
          <p className="text-xs text-minimal-muted font-medium uppercase tracking-widest">&copy; 2025 TravelMate</p>
        </footer>
        <AIChat />
      </div>
    </Router>
  );
}

export default App;
