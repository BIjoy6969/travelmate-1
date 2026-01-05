const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destinationId: {
        type: String,
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
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    // Plan number for this destination (e.g., "Plan 1", "Plan 2")
    planNumber: {
        type: Number,
        default: 1
    },
    // Trip planning fields (merged from Budget)
    travelStyle: {
        type: String,
        enum: ['Budget', 'Standard', 'Luxury'],
        default: 'Standard'
    },
    totalBudget: {
        type: Number
    },
    tripStartDate: {
        type: Date
    },
    tripEndDate: {
        type: Date
    },
    estimatedBreakdown: [
        {
            category: String,
            amount: Number,
            description: String
        }
    ],
    itinerary: [
        {
            day: Number,
            activities: [
                {
                    name: String,
                    cost: Number
                }
            ],
            estimatedCost: Number
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
