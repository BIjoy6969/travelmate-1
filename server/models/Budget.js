const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Transport', 'Lodging', 'Activities', 'Shopping', 'Other']
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const BudgetSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
        // Removed unique: true to allow multiple trips per user
    },
    destinationId: {
        type: String // To link with Favorites
    },
    totalBudget: {
        type: Number,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    travelStyle: {
        type: String,
        enum: ['Budget', 'Standard', 'Luxury'],
        default: 'Standard'
    },
    // Actual expenses tracked during the trip
    expenses: [ExpenseSchema],
    // Estimated breakdown from AI (editable)
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
            activities: [String],
            estimatedCost: Number
        }
    ],
    tripStartDate: { // Added for "Safe to Spend" daily calc
        type: Date
    },
    tripEndDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);
