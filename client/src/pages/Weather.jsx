import { useState } from "react";
import { weatherService } from "../services/api";

export default function Weather() {
  const [city, setCity] = useState("Dhaka");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await weatherService.getWeather(city.trim());
      setData(res.data);
    } catch {
      setError("Weather fetch failed.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tm-page space-y-6">
      <div className="tm-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Weather</p>
            <h1 className="mt-2 text-2xl font-semibold">Check destination weather</h1>
          </div>
          <span className="tm-badge">Live</span>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            className="tm-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
            placeholder="City name"
          />
          <button onClick={fetchWeather} disabled={loading} className="tm-btn-primary">
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        {data && (
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="tm-panel md:col-span-1">
              <p className="text-xs text-slate-400">City</p>
              <p className="mt-2 text-xl font-semibold">{data.city}</p>
              <p className="mt-4 text-4xl font-semibold text-sky-300">
                {Math.round(data.temperature ?? data.temp ?? 0)}°C
              </p>
              <p className="mt-2 text-sm text-slate-300 capitalize">{data.description}</p>
            </div>

            <div className="tm-panel md:col-span-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs text-slate-400">Feels</p>
                  <p className="mt-1 text-lg font-semibold">{data.feelsLike}°C</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs text-slate-400">Humidity</p>
                  <p className="mt-1 text-lg font-semibold">{data.humidity}%</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs text-slate-400">Wind</p>
                  <p className="mt-1 text-lg font-semibold">{data.windSpeed ?? 0} m/s</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
