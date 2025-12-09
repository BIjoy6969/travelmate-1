import { useState } from "react";
import AIChat from "./pages/AIChat";
import BudgetTracker from "./pages/BudgetTracker";
import FavoritesPage from "./pages/FavoritesPage";
import WeatherPage from "./pages/WeatherPage";

const App = () => {
  const [currentPage, setCurrentPage] = useState("weather");

  const renderPage = () => {
    switch (currentPage) {
      case "favorites":
        return <FavoritesPage />;
      case "budget":
        return <BudgetTracker />;
      case "chat":
        return <AIChat />;
      case "weather":
      default:
        return <WeatherPage />;
    }
  };
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FavoritesPage from './pages/FavoritesPage';
import BudgetTracker from './pages/BudgetTracker';
import AIChat from './pages/AIChat';
import DestinationsPage from './pages/DestinationsPage';
import './App.css'

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple top navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-2 items-center justify-between">
          <h1 className="text-xl font-bold text-blue-700">TravelMate</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentPage("weather")}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                currentPage === "weather"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Weather Update
            </button>
            <button
              onClick={() => setCurrentPage("favorites")}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                currentPage === "favorites"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setCurrentPage("budget")}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                currentPage === "budget"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Budget Tracker
            </button>
            <button
              onClick={() => setCurrentPage("chat")}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                currentPage === "chat"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              AI Chat
            </button>
          </div>
        </div>
      </nav>
    <Router>
      <div className="app-container min-h-screen bg-gray-50">
        {/* Temporary Navigation for Member 3 Dev */}
        <nav className="bg-white shadow p-4 mb-4">
          <div className="max-w-7xl mx-auto flex gap-4">
            <Link to="/" className="text-blue-600 font-bold hover:underline">Home</Link>
            <Link to="/destinations" className="text-blue-600 font-bold hover:underline">Destinations</Link>
            <Link to="/favorites" className="text-blue-600 font-bold hover:underline">Favorites</Link>
            <Link to="/budget" className="text-blue-600 font-bold hover:underline">Budget</Link>
            <Link to="/chat" className="text-blue-600 font-bold hover:underline">AI Assistant</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="p-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">TravelMate</h1>
              <p className="text-xl text-gray-600">Welcome to your ultimate travel companion.</p>
              <p className="mt-4 text-sm text-gray-400">Navigate to 'Destinations', 'Favorites', 'Budget', or 'AI Assistant'.</p>
            </div>
          } />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/budget" element={<BudgetTracker />} />
          <Route path="/chat" element={<AIChat />} />
        </Routes>
      </div>
    </Router>
  )
}

      {/* Page content */}
      <div className="py-4">{renderPage()}</div>
    </div>
  );
};

export default App;
