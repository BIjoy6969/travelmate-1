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

      {/* Page content */}
      <div className="py-4">{renderPage()}</div>
    </div>
  );
};

export default App;
