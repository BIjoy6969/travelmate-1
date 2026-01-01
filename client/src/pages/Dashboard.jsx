import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  dashboardService,
  exportService,
  currencyService,
  DEMO_USER_ID,
} from "../services/api";

const currencyOptions = [
  { code: "USD", name: "USA", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "UK", flag: "🇬🇧" },
  { code: "CAD", name: "Canada", flag: "🇨🇦" },
  { code: "AUD", name: "Australia", flag: "🇦🇺" },
  { code: "JPY", name: "Japan", flag: "🇯🇵" },
  { code: "CNY", name: "China", flag: "🇨🇳" },
  { code: "INR", name: "India", flag: "🇮🇳" },
  { code: "AED", name: "UAE", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi", flag: "🇸🇦" },
  { code: "BDT", name: "Bangladesh", flag: "🇧🇩" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // ✅ IMPORTANT: start empty so PDF Weather/Currency stays blank until user searches
  const [city, setCity] = useState("");
  const [lastSearchedCity, setLastSearchedCity] = useState("");

  // Currency used in dashboard + pdf
  const [base, setBase] = useState("USD");
  const [target, setTarget] = useState("BDT");
  const [amount, setAmount] = useState(100);

  // Dashboard data
  const [data, setData] = useState(null);

  // Currency snapshot
  const [curRate, setCurRate] = useState(null);
  const [curResult, setCurResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingCur, setLoadingCur] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString(undefined, { maximumFractionDigits: 4 })
      : "—";

  const loadCurrency = async ({ b = base, t = target, a = amount } = {}) => {
    // ✅ If user didn't search location yet, keep currency blank
    if (!lastSearchedCity) return;

    setLoadingCur(true);
    try {
      const res = await currencyService.convert(b, t, a);
      setCurRate(res.data.rate ?? null);
      setCurResult(res.data.result ?? null);
    } catch {
      setCurRate(null);
      setCurResult(null);
    } finally {
      setLoadingCur(false);
    }
  };

  const loadDashboard = async () => {
    setError("");
    setLoading(true);

    const c = city.trim();

    try {
      // ✅ If city is empty: load stats only; weather/currency remain blank
      const res = await dashboardService.getDashboard({
        userId: DEMO_USER_ID,
        city: c || undefined,
        base,
        target,
        amount,
      });

      setData(res.data);
      setLastUpdated(new Date());

      // ✅ only mark searched when user actually provided a city
      if (c) setLastSearchedCity(c);
      else setLastSearchedCity("");

      // ✅ Currency should be blank if no searched city
      if (!c) {
        setCurRate(null);
        setCurResult(null);
        return;
      }

      // Some backends might return currency; otherwise fetch it
      const dashCurrency = res.data?.currency;
      if (dashCurrency?.rate != null && dashCurrency?.result != null) {
        setCurRate(dashCurrency.rate);
        setCurResult(dashCurrency.result);
      } else {
        const money = await currencyService.convert(base, target, amount);
        setCurRate(money.data.rate ?? null);
        setCurResult(money.data.result ?? null);
      }
    } catch (e) {
      setError(
        e?.response?.data?.error ||
        "Dashboard failed to load. Check backend + MongoDB connection."
      );
      setData(null);
      setCurRate(null);
      setCurResult(null);
      setLastSearchedCity("");
    } finally {
      setLoading(false);
    }
  };

  // ✅ initial load: stats only, no weather/currency
  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const trips = data?.trips?.length ?? 0;
    const flights =
      data?.flights?.length ??
      data?.bookings?.length ??
      data?.flightBookings?.length ??
      0;
    const totalSpent = Number(data?.totalSpent ?? data?.totalExpense ?? 0);
    return { trips, flights, totalSpent };
  }, [data]);

  const weather = data?.weather;
  const weatherTemp =
    weather?.temperature ?? weather?.temp ?? weather?.main?.temp ?? null;

  // ✅ Export: if user didn't search any city, don't send city/base/target/amount
  const exportPDF = () => {
    if (!lastSearchedCity) {
      exportService.exportPDF({ userId: DEMO_USER_ID }); // ✅ blank sections in PDF
      return;
    }

    exportService.exportPDF({
      userId: DEMO_USER_ID,
      city: lastSearchedCity,
      base,
      target,
      amount,
    });
  };

  const clearLocation = () => {
    setCity("");
    setLastSearchedCity("");
    setCurRate(null);
    setCurResult(null);
    // load stats only
    setData((p) => ({ ...p, weather: null, currency: null }));
  };

  const StatCard = ({ label, value, hint }) => (
    <div className="tm-panel bg-white">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="tm-card">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Here is your travel overview.
            </p>

            {lastUpdated && (
              <p className="mt-2 text-xs text-slate-400">
                Last updated:{" "}
                <span className="font-medium text-slate-600">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Hero / Search Section (Gozayaan Style) */}
        <div className="relative mt-6 overflow-hidden rounded-2xl bg-blue-600 text-white shadow-xl">
          {/* Decorative Background Image / Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
          <div
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-40"
            aria-hidden="true"
          />

          <div className="relative p-8 md:p-10">
            <h2 className="mb-6 text-center text-2xl font-bold text-white md:text-3xl drop-shadow-sm">
              Where is your next adventure?
            </h2>

            {/* Floating Search Bar */}
            <div className="rounded-xl bg-white p-4 shadow-lg md:p-6 text-slate-900">
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-4">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Destination</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-slate-400">📍</span>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="tm-input pl-9 border-slate-200 bg-slate-50 font-semibold focus:bg-white"
                      placeholder="City or Airport"
                      onKeyDown={(e) => e.key === "Enter" && loadDashboard()}
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Currency From</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-slate-400">💵</span>
                    <select
                      className="tm-select pl-9 border-slate-200 bg-slate-50 font-semibold focus:bg-white"
                      value={base}
                      onChange={(e) => setBase(e.target.value)}
                    >
                      {currencyOptions.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Currency To</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-slate-400">🇧🇩</span>
                    <select
                      className="tm-select pl-9 border-slate-200 bg-slate-50 font-semibold focus:bg-white"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                    >
                      {currencyOptions.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Budget</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value || 0))}
                    className="tm-input mt-1 border-slate-200 bg-slate-50 font-semibold focus:bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-end border-t border-slate-100 pt-5">
                <button
                  onClick={clearLocation}
                  className="tm-btn-secondary px-5 text-xs text-slate-500"
                >
                  Clear
                </button>
                <button
                  onClick={exportPDF}
                  className="tm-btn-secondary px-5"
                >
                  📄 Export PDF
                </button>
                <button
                  onClick={loadDashboard}
                  disabled={loading}
                  className="tm-btn-primary px-10 py-3 text-base shadow-xl"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* Currency Updater Text */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => loadCurrency()}
                disabled={loadingCur || !lastSearchedCity}
                className="text-xs text-blue-100 hover:text-white underline underline-offset-2 opacity-80"
              >
                {loadingCur ? "Updating rates..." : "Update latest conversion rates"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Trips" value={stats.trips} hint="Total trips planned" />
          <StatCard label="Bookings" value={stats.flights} hint="Active flight bookings" />
          <StatCard
            label="Total Spending"
            value={`৳${stats.totalSpent.toLocaleString()}`}
            hint="Total expenses"
          />
        </div>

        {/* Snapshots */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Weather snapshot */}
          <div className="tm-panel bg-sky-50/50 border-sky-100">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Weather
            </p>

            {!lastSearchedCity ? (
              <p className="mt-4 text-sm text-slate-500">Search a city above to view forecast.</p>
            ) : weather ? (
              <>
                <p className="mt-4 text-xl font-bold text-slate-800">
                  {weather.city || lastSearchedCity}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold text-slate-900">
                    {weatherTemp !== null ? `${Math.round(weatherTemp)}°` : "—"}
                  </p>
                  <p className="text-sm font-medium text-slate-500 capitalize">
                    {weather.description || "—"}
                  </p>
                </div>
                {typeof weather.humidity === "number" && (
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Humidity: {weather.humidity}%
                  </p>
                )}
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Loading...</p>
            )}
          </div>

          {/* Currency snapshot */}
          <div className="tm-panel bg-emerald-50/50 border-emerald-100">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Currency
            </p>

            {!lastSearchedCity ? (
              <p className="mt-4 text-sm text-slate-500">Search a city above to check rates.</p>
            ) : (
              <>
                <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Rate</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {curRate ? `1 ${base} = ${fmt(curRate)} ${target}` : "—"}
                  </p>

                  <div className="my-3 h-px bg-slate-100" />

                  <p className="text-xs font-semibold text-slate-400 uppercase">Converted</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                    {curResult != null ? `${fmt(curResult)} ${target}` : "—"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}
