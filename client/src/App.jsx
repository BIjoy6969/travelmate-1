import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";

import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import Expenses from "./pages/Expenses";
import Flights from "./pages/Flights";
import Weather from "./pages/Weather";
import Currency from "./pages/Currency";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              {/* Enhanced Logo Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl shadow-lg shadow-blue-200">
                <span className="filter drop-shadow-md">✈️</span>
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Travel<span className="text-blue-600">Mate</span>
                </p>
                <p className="text-xs font-semibold text-slate-500 tracking-wide mt-0.5">
                  EXPLORE THE WORLD
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="h-9 w-9 rounded-full bg-slate-100 ring-1 ring-slate-200" />
            </div>
          </div>

          {/* Nav */}
          <Navigation />
        </header>

        {/* Main */}
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/flights" element={<Flights />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/currency" element={<Currency />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-slate-500">
            &copy; 2025 TravelMate. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}
