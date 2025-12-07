const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    userId: {
        type: String, // Mocking user ID for now
        required: true
    },
    destinationId: {
        type: String, // ID from external API (Google/TripAdvisor)
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    location: {
        type: String
    },
    notes: {
        type: String,
        default: '' // User can add personal notes here
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
