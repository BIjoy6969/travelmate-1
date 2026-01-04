import { useEffect, useMemo, useState } from "react";
import { flightService, DEMO_USER_ID } from "../services/api";

export default function Flights() {
  const [from, setFrom] = useState("DAC");
  const [to, setTo] = useState("DXB");
  const [date, setDate] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({
    from: "",
    to: "",
    date: "",
    price: "",
    airline: "",
    bookingRef: "",
  });

  const [error, setError] = useState("");

  const canSearch = useMemo(() => from.trim() && to.trim() && date, [from, to, date]);

  const loadSaved = async () => {
    setError("");
    setLoadingSaved(true);
    try {
      if (flightService.bookings) {
        const res = await flightService.bookings(DEMO_USER_ID);
        setSaved(res.data || []);
      } else {
        const res = await flightService.getAll(DEMO_USER_ID);
        setSaved(res.data || []);
      }
    } catch {
      setSaved([]);
      setError("Failed to load bookings.");
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleSearch = async () => {
    if (!canSearch) return;
    setError("");
    setSearching(true);

    try {
      if (flightService.search) {
        const res = await flightService.search(from.trim(), to.trim(), date);
        const list = res.data?.results || res.data || [];
        setSearchResults(list);
      } else {
        const demo = [
          { airline: "SkyWays", price: 510, from, to, date, bookingRef: `DEMO-${Date.now()}-1` },
          { airline: "Cloud Jet", price: 610, from, to, date, bookingRef: `DEMO-${Date.now()}-2` },
          { airline: "Demo Air", price: 420, from, to, date, bookingRef: `DEMO-${Date.now()}-3` },
        ];
        setSearchResults(demo);
      }
    } catch {
      setSearchResults([]);
      setError("Search failed.");
    } finally {
      setSearching(false);
    }
  };

  const bookFlight = async (f) => {
    setError("");
    try {
      if (flightService.book) {
        await flightService.book({ ...f, userId: DEMO_USER_ID });
      } else {
        await flightService.create({
          ...f,
          userId: DEMO_USER_ID,
          price: Number(f.price || 0),
        });
      }
      await loadSaved();
      setSearchResults((prev) => prev.filter((x) => x.bookingRef !== f.bookingRef));
    } catch {
      setError("Booking failed.");
    }
  };

  const deleteSaved = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    setError("");
    try {
      if (flightService.cancel) {
        await flightService.cancel(id);
      } else {
        await flightService.delete(id);
      }
      await loadSaved();
    } catch {
      setError("Delete failed.");
    }
  };

  const submitManual = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await flightService.create({
        ...manual,
        userId: DEMO_USER_ID,
        price: Number(manual.price || 0),
      });
      setShowManual(false);
      setManual({ from: "", to: "", date: "", price: "", airline: "", bookingRef: "" });
      await loadSaved();
    } catch {
      setError("Failed to save flight.");
    }
  };

  return (
    <div className="space-y-6 tm-page">
      {/* SEARCH */}
      <div className="tm-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Flights
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-100">Search & Book</h1>
            <p className="mt-1 text-xs text-slate-300">
              Demo search (or API search if available). Book to save to dashboard.
            </p>
          </div>

          <button
            onClick={() => setShowManual((s) => !s)}
            className="tm-btn-secondary"
          >
            {showManual ? "Close Manual" : "Manual Add"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-5 grid gap-3 md:grid-cols-5 items-end">
          <div>
            <label className="text-xs text-slate-300">From</label>
            <input className="tm-input mt-2" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="DAC" />
          </div>

          <div>
            <label className="text-xs text-slate-300">To</label>
            <input className="tm-input mt-2" value={to} onChange={(e) => setTo(e.target.value)} placeholder="DXB" />
          </div>

          <div>
            <label className="text-xs text-slate-300">Date</label>
            <input className="tm-input mt-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <button
            onClick={handleSearch}
            disabled={!canSearch || searching}
            className="tm-btn-primary md:col-span-2"
          >
            {searching ? "Searching..." : "Search Flights"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        {/* Results */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-100">Results</p>
            <span className="tm-badge">{searchResults.length} options</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="mt-3 tm-panel text-sm text-slate-300">
              Search a route to show flight options.
            </div>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {searchResults.map((f, idx) => (
                <div key={f.bookingRef || idx} className="tm-panel">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-100">
                        {f.from} → {f.to}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {f.airline || "Airline"} • {f.date}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-emerald-300">
                        ${Number(f.price || 0).toFixed(0)}
                      </p>
                      {f.bookingRef && (
                        <p className="mt-1 text-xs text-slate-500">Ref: {f.bookingRef}</p>
                      )}
                    </div>

                    <button onClick={() => bookFlight(f)} className="tm-btn-primary">
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Manual Add */}
          {showManual && (
            <div className="mt-6 tm-panel">
              <p className="text-sm font-semibold text-slate-100">Manual Booking</p>
              <form onSubmit={submitManual} className="mt-4 grid gap-3 md:grid-cols-3">
                <input required className="tm-input" placeholder="From" value={manual.from}
                  onChange={(e) => setManual({ ...manual, from: e.target.value })} />
                <input required className="tm-input" placeholder="To" value={manual.to}
                  onChange={(e) => setManual({ ...manual, to: e.target.value })} />
                <input required type="date" className="tm-input" value={manual.date}
                  onChange={(e) => setManual({ ...manual, date: e.target.value })} />
                <input className="tm-input" placeholder="Airline" value={manual.airline}
                  onChange={(e) => setManual({ ...manual, airline: e.target.value })} />
                <input required type="number" className="tm-input" placeholder="Price" value={manual.price}
                  onChange={(e) => setManual({ ...manual, price: e.target.value })} />
                <input className="tm-input" placeholder="Booking Ref" value={manual.bookingRef}
                  onChange={(e) => setManual({ ...manual, bookingRef: e.target.value })} />
                <button type="submit" className="tm-btn-primary md:col-span-3">
                  Save Booking
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* SAVED BOOKINGS */}
      <div className="tm-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Booked Flights</h2>
          <button onClick={loadSaved} className="tm-btn-secondary">
            Refresh
          </button>
        </div>

        {loadingSaved ? (
          <p className="mt-4 text-sm text-slate-400">Loading...</p>
        ) : saved.length === 0 ? (
          <div className="mt-4 tm-panel text-sm text-slate-300">No bookings yet.</div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {saved.map((f) => (
              <div key={f._id} className="tm-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-100">
                      {f.from} → {f.to}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {f.airline || "Airline"} • {f.date}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-emerald-300">
                      ${Number(f.price || 0).toFixed(0)}
                    </p>
                    {f.bookingRef && <p className="mt-1 text-xs text-slate-500">Ref: {f.bookingRef}</p>}
                  </div>

                  <button onClick={() => deleteSaved(f._id)} className="tm-btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
