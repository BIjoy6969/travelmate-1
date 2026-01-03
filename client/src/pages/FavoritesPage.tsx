import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, MapPin } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const FavoritesPage: React.FC = () => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [currentFavorite, setCurrentFavorite] = useState<any>(null);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const res = await api.get(`/favorites/${user?._id}`);
            setFavorites(res.data);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    const removeFavorite = async (id: string) => {
        if (!window.confirm("Are you sure you want to remove this favorite?")) return;
        try {
            await api.delete(`/favorites/${id}`);
            setFavorites(favorites.filter(fav => fav._id !== id));
        } catch (error) {
            console.error("Error deleting favorite:", error);
        }
    };

    const openNoteModal = (fav: any) => {
        setCurrentFavorite(fav);
        setNoteText(fav.notes || '');
        setIsNoteModalOpen(true);
    };

    const saveNote = async () => {
        if (!currentFavorite) return;
        try {
            const res = await api.patch(`/favorites/${currentFavorite._id}`, { notes: noteText });
            const updatedFav = res.data;

            setFavorites(favorites.map(f => f._id === updatedFav._id ? updatedFav : f));
            setIsNoteModalOpen(false);
            setCurrentFavorite(null);
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-8">
            <Navbar />
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">My Favorite Destinations</h1>

                {favorites.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                        <p className="text-gray-500 text-lg">No favorites saved yet. Go explore!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map(fav => (
                            <div key={fav._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <img
                                    src={fav.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                                    alt={fav.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">{fav.name}</h2>
                                            <div className="flex items-center text-gray-600 mt-1">
                                                <MapPin size={16} className="mr-1" />
                                                <span className="text-sm">{fav.location || "Unknown Location"}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFavorite(fav._id)}
                                            className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-full"
                                            title="Remove Favorite"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">My Notes</span>
                                            <button onClick={() => openNoteModal(fav)} className="text-yellow-600 hover:text-yellow-800">
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1 italic">
                                            {fav.notes || "No notes added yet..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Note Modal */}
                {isNoteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-lg font-bold mb-4">Edit Note for {currentFavorite?.name}</h3>
                            <textarea
                                className="w-full border rounded p-2 h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Why I want to go here..."
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setIsNoteModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveNote}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
