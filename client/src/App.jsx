import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from "react";
import FavoritesPage from './pages/FavoritesPage';
import BudgetTracker from './pages/BudgetTracker';
import AIChat from './pages/AIChat';
import DestinationsPage from './pages/DestinationsPage';
import WeatherPage from "./pages/WeatherPage";
import './App.css'

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-700">TravelMate</Link>
            <div className="flex flex-wrap gap-2">
              <Link to="/weather" className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Weather</Link>
              <Link to="/destinations" className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Destinations</Link>
              <Link to="/favorites" className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Favorites</Link>
              <Link to="/budget" className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Budget</Link>
              <Link to="/chat" className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">AI Chat</Link>
            </div>
          </div>
        </nav>

        <div className="py-4">
          <Routes>
            <Route path="/" element={
              <div className="p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">TravelMate</h1>
                <p className="text-xl text-gray-600">Welcome to your ultimate travel companion.</p>
                <p className="mt-4 text-sm text-gray-400">Navigate using the menu above to explore features.</p>
              </div>
            } />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/budget" element={<BudgetTracker />} />
            <Route path="/chat" element={<AIChat />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
