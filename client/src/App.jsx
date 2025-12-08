import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FavoritesPage from './pages/FavoritesPage';
import BudgetTracker from './pages/BudgetTracker';
import AIChat from './pages/AIChat';
import DestinationsPage from './pages/DestinationsPage';
import './App.css'

function App() {
  return (
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

export default App

