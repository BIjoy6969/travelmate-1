import { useMemo, useState } from "react";
import { weatherService } from "../services/api";

function toTitleCase(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default function WeatherWidget({
  defaultCity = "Dhaka",
  compact = false,
  onCityChange,
}) {
  const [city, setCity] = useState(defaultCity);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeholder = useMemo(() => (compact ? "City…" : "Enter a city (e.g., Cox's Bazar)"), [compact]);

  const fetchWeather = async (overrideCity) => {
    const query = (overrideCity ?? city).trim();
    if (!query) return;

    setLoading(true);
    setError("");
    try {
      const res = await weatherService.getWeather(query);
      setData(res.data);
      onCityChange?.(query);
    } catch (e) {
      setData(null);
      setError(
        e?.response?.data?.error ||
        "Could not load weather. Please try another city."
      );
    } finally {
      setLoading(false);
    }
  };

  const temp = data?.temperature;
  const feels = data?.feelsLike;

  return (
    <div className={compact ? "" : "w-full"}>
      <div className={`rounded-2xl border border-slate-200 bg-white/90 shadow-sm ${compact ? "p-4" : "p-6"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">🌤️ Weather</p>
            <p className="text-xs text-slate-500">
              Current Weather
            </p>
          </div>
          {data?.updatedAt && (
            <p className="text-[11px] text-slate-400">
              Updated: {new Date(data.updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchWeather();
            }}
          />
          <button
            onClick={() => fetchWeather()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
            disabled={loading}
          >
            {loading ? "Loading…" : "Check"}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {data && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {toTitleCase(data.city)}, {data.country}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {toTitleCase(data.description)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Temperature</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {typeof temp === "number" ? `${Math.round(temp)}°C` : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Feels like</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {typeof feels === "number" ? `${Math.round(feels)}°C` : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Humidity</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data.humidity != null ? `${data.humidity}%` : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Wind</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {data.windSpeed != null ? `${data.windSpeed} m/s` : "—"}
              </p>
            </div>
          </div>
        )}

        {!data && !error && (
          <p className="mt-4 text-sm text-slate-500">
            Tip: try <span className="font-semibold text-slate-700">Dhaka</span>,{" "}
            <span className="font-semibold text-slate-700">Sylhet</span>,{" "}
            <span className="font-semibold text-slate-700">Chittagong</span>.
          </p>
        )}
      </div>
    </div>
  );
}
