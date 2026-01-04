import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import React from 'react';
import FavoritesPage from './pages/FavoritesPage';
import AIChat from './components/AIChat';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ItineraryGenerator from './pages/ItineraryGenerator';
import HotelSearch from './pages/HotelSearch';
import BookingHistory from './pages/BookingHistory';
import { Heart, Globe, MapPin, Sparkles, Plane, Hotel, Calendar } from 'lucide-react';
import './App.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center">
          <h1 className="text-xl font-bold text-red-600">Something went wrong.</h1>
          <pre className="text-left bg-gray-100 p-4 mt-4 rounded overflow-auto max-w-2xl mx-auto text-xs">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const Navigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-[1000] w-full bg-white border-b border-minimal-border py-4 px-6 md:px-12 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-800 rounded-lg flex items-center justify-center">
          <Globe size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-minimal-text">TravelMate</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link to="/planner" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/planner') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Sparkles size={16} />
          <span>Planner</span>
        </Link>
        <Link to="/itinerary" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/itinerary') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Calendar size={16} />
          <span>Itinerary</span>
        </Link>
        <Link to="/hotels" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/hotels') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Hotel size={16} />
          <span>Hotels</span>
        </Link>
        <Link to="/bookings" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/bookings') ? 'text-brand-800' : 'text-minimal-muted hover:text-minimal-text'}`}>
          <Plane size={16} />
          <span>Bookings</span>
        </Link>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container min-h-screen bg-minimal-bg flex flex-col">
        <Navigation />

        <main className="flex-grow animate-in-faded">
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center space-y-8">
                <div className="space-y-4 max-w-3xl">
                  <h1 className="text-5xl md:text-7xl font-bold text-minimal-text tracking-tight">
                    Plan Smarter, <span className="text-minimal-muted font-normal">Travel Better.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-minimal-muted leading-relaxed font-light">
                    Search any destination, let AI generate your budget and itinerary, and save your favorite spots.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Link to="/planner" className="btn-minimal-primary shadow-sm flex items-center gap-2">
                    <Sparkles size={16} />
                    Start Planning
                  </Link>
                </div>

                <div className="w-full max-w-5xl pt-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-white border border-minimal-border rounded-xl text-left space-y-3">
                      <MapPin size={24} className="text-brand-800" />
                      <h3 className="text-lg font-bold">1. Search Destination</h3>
                      <p className="text-sm text-minimal-muted">Find any place in the world using our global search powered by OpenStreetMap.</p>
                    </div>
                    <div className="p-8 bg-white border border-minimal-border rounded-xl text-left space-y-3">
                      <Heart size={24} className="text-brand-800" />
                      <h3 className="text-lg font-bold">2. Save Favorites</h3>
                      <p className="text-sm text-minimal-muted">Keep track of destinations you love and add personal notes.</p>
                    </div>
                    <div className="p-8 bg-white border border-minimal-border rounded-xl text-left space-y-3">
                      <Sparkles size={24} className="text-brand-800" />
                      <h3 className="text-lg font-bold">3. AI Budget & Itinerary</h3>
                      <p className="text-sm text-minimal-muted">Gemini AI generates a day-by-day plan with cost estimates based on your travel style.</p>
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/planner" element={<ErrorBoundary><FavoritesPage /></ErrorBoundary>} />
            <Route path="/favorites" element={<ErrorBoundary><FavoritesPage /></ErrorBoundary>} />
            <Route path="/itinerary" element={<ErrorBoundary><ItineraryGenerator /></ErrorBoundary>} />
            <Route path="/hotels" element={<ErrorBoundary><HotelSearch /></ErrorBoundary>} />
            <Route path="/bookings" element={<ErrorBoundary><BookingHistory /></ErrorBoundary>} />
          </Routes>
        </main>

        <footer className="py-12 border-t border-minimal-border text-center">
          <p className="text-xs text-minimal-muted font-medium uppercase tracking-widest">TravelMate</p>
        </footer>
        <AIChat />
      </div>
    </Router>
  );
}

export default App;
