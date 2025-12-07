const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    targetId: {
        type: String, // ID of the destination or hotel being reviewed
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    categories: {
        cleanliness: { type: Number, min: 1, max: 5 },
        location: { type: Number, min: 1, max: 5 },
        service: { type: Number, min: 1, max: 5 },
        value: { type: Number, min: 1, max: 5 }
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
