import React, { useState, useEffect } from 'react'; //useState → a React hook used to store and update state (form values, errors).
//useEffect → a React hook used to run code when something changes (here: when editing an existing trip).

interface TripFormProps {
    existingTrip?: any;
    onSave: (tripData: any) => Promise<void>;
    onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ existingTrip, onSave, onCancel }) => {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tripType, setTripType] = useState('solo');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingTrip) {
            setDestination(existingTrip.destination);
            setStartDate(existingTrip.startDate.split('T')[0]);
            setEndDate(existingTrip.endDate.split('T')[0]);
            setTripType(existingTrip.tripType);
            setNotes(existingTrip.notes || '');
        }
    }, [existingTrip]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (new Date(startDate) > new Date(endDate)) {
            setError('End date must be after start date');
            return;
        }

        try {
            await onSave({ destination, startDate, endDate, tripType, notes });
        } catch (err: any) {
            setError(err.message || 'Failed to save trip');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{existingTrip ? 'Edit Trip' : 'Plan New Trip'}</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Destination</label>
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="w-1/2">
                    <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Trip Type</label>
                <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                    <option value="solo">Solo</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="friends">Friends</option>
                    <option value="business">Business</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Notes</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                />
            </div>

            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {existingTrip ? 'Update Trip' : 'Create Trip'}
                </button>
            </div>
        </form>
    );
};

export default TripForm;
