import React, { useState, useEffect } from 'react';
import { flightService } from '../services/api';
import { Trash2, Plus, Search, MapPin, Calendar, Loader2, Info, ArrowRight, Plane } from 'lucide-react';

const Flights = () => {
  // Search State
  const [searchForm, setSearchForm] = useState({
    from: 'DAC',
    to: 'DXB',
    date: new Date().toISOString().split('T')[0],
    adults: 1,
    cabinClass: 'Economy'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({
    from: '', to: '', date: '', airline: '', price: '', bookingRef: ''
  });


  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await flightService.bookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      setError('Could not load your bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError('');
    try {
      const res = await flightService.search(searchForm.from, searchForm.to, searchForm.date);
      setSearchResults(res.data);
      if (res.data.length === 0) setError('No flights found for these criteria.');
    } catch (err) {
      setError(err.response?.data?.message || 'Flight search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const bookFlight = async (flight) => {
    try {
      const bookingData = {
        flightData: {
          airline: flight.airline,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          origin: flight.origin,
          destination: flight.destination,
          price: flight.price,
          duration: flight.duration,
          stops: flight.stops,
          deepLink: flight.deepLink
        },
        passengers: searchForm.adults,
        totalPrice: flight.price * searchForm.adults
      };
      await flightService.book(bookingData);
      alert('Flight booked successfully!');
      fetchBookings();
    } catch (err) {
      alert('Booking failed.');
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await flightService.cancel(id);
      fetchBookings();
    } catch (err) {
      alert('Failed to delete booking.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        flightData: {
          airline: manualForm.airline,
          departureTime: manualForm.date,
          arrivalTime: manualForm.date,
          origin: manualForm.from,
          destination: manualForm.to,
          price: Number(manualForm.price),
          flightNumber: manualForm.bookingRef
        },
        passengers: 1,
        totalPrice: Number(manualForm.price)
      };
      await flightService.book(bookingData);
      setShowManual(false);
      setManualForm({ from: '', to: '', date: '', airline: '', price: '', bookingRef: '' });
      fetchBookings();
    } catch (err) {
      alert('Manual save failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Global Flight Search</h1>
          <p className="text-slate-500 mt-2 text-lg">Compare and book flights across thousands of destinations.</p>
        </div>
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          {showManual ? <Trash2 size={18} /> : <Plus size={18} />}
          {showManual ? 'Cancel' : 'Add Missing Flight'}
        </button>
      </div>

      {/* Search Section */}
      {!showManual && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">From</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Origin (e.g. DAC)"
                  value={searchForm.from}
                  onChange={e => setSearchForm({ ...searchForm, from: e.target.value.toUpperCase() })}
                  maxLength={3}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">To</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Destination (e.g. DXB)"
                  value={searchForm.to}
                  onChange={e => setSearchForm({ ...searchForm, to: e.target.value.toUpperCase() })}
                  maxLength={3}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchForm.date}
                  onChange={e => setSearchForm({ ...searchForm, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Class</label>
              <select
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                value={searchForm.cabinClass}
                onChange={e => setSearchForm({ ...searchForm, cabinClass: e.target.value })}
              >
                <option>Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
            </div>
            <button
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 px-6 font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {searching ? <Loader2 className="animate-spin" /> : <Search size={20} />}
              {searching ? 'Searching...' : 'Find Flights'}
            </button>
          </form>
        </div>
      )}

      {/* Manual Form Section */}
      {showManual && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Enter Details Manually</h2>
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input className="tm-input-minimal" placeholder="From (e.g. JFK)" value={manualForm.from} onChange={e => setManualForm({ ...manualForm, from: e.target.value })} />
            <input className="tm-input-minimal" placeholder="To (e.g. LHR)" value={manualForm.to} onChange={e => setManualForm({ ...manualForm, to: e.target.value })} />
            <input type="date" className="tm-input-minimal" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} />
            <input className="tm-input-minimal" placeholder="Airline Name" value={manualForm.airline} onChange={e => setManualForm({ ...manualForm, airline: e.target.value })} />
            <input type="number" className="tm-input-minimal" placeholder="Amount (USD)" value={manualForm.price} onChange={e => setManualForm({ ...manualForm, price: e.target.value })} />
            <input className="tm-input-minimal" placeholder="Ref / Flight #" value={manualForm.bookingRef} onChange={e => setManualForm({ ...manualForm, bookingRef: e.target.value })} />
            <button type="submit" className="md:col-span-3 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">Save to My Dashboard</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {searchResults.length > 0 ? 'Best Options' : 'Available Offers'}
            <span className="text-sm font-normal text-slate-400 ml-2 bg-slate-100 px-3 py-1 rounded-full">{searchResults.length} found</span>
          </h3>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3">
              <Info size={20} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!searching && searchResults.length === 0 && !error && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
              <Plane size={48} className="mb-4 opacity-20" />
              <p>Enter your search criteria above to see results.</p>
            </div>
          )}

          <div className="grid gap-6">
            {searchResults.map((flight, idx) => (
              <div key={idx} className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-grow flex items-center justify-between gap-8 py-2">
                    <div className="text-center md:text-left">
                      <p className="text-3xl font-black text-slate-900">{flight.origin}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex-grow flex flex-col items-center">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{flight.duration}</p>
                      <div className="w-full flex items-center gap-2">
                        <div className="h-[2px] flex-grow bg-slate-100"></div>
                        <Plane className="text-blue-500 group-hover:translate-x-4 transition-transform duration-700" size={16} />
                        <div className="h-[2px] flex-grow bg-slate-100"></div>
                      </div>
                      <p className="text-[10px] font-bold text-blue-500 mt-2">{flight.stops === 0 ? 'DIRECT' : `${flight.stops} STOP`}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-3xl font-black text-slate-900">{flight.destination}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="md:w-px md:h-20 bg-slate-100"></div>
                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-2 md:w-32">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase leading-none mb-1">{flight.airline}</p>
                      <p className="text-2xl font-black text-slate-900">${flight.price}</p>
                    </div>
                    <button onClick={() => bookFlight(flight)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm">Book</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Column */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900">Your Bookings</h3>

          {loadingBookings ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-300" /></div>
          ) : bookings.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-3xl text-center border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">No bookings recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded italic">Booked</p>
                    <button onClick={() => deleteBooking(booking._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-slate-900 font-bold">
                    <span>{booking.flightData.origin}</span>
                    <ArrowRight size={14} className="text-slate-400" />
                    <span>{booking.flightData.destination}</span>
                  </div>
                  <div className="mt-3 flex justify-between items-end">
                    <div className="text-xs text-slate-500">
                      <p>{booking.flightData.airline}</p>
                      <p className="mt-1">{new Date(booking.flightData.departureTime || booking.bookingDate).toLocaleDateString()}</p>
                    </div>
                    <p className="text-lg font-black text-slate-900">${booking.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flights;
