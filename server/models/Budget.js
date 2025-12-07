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
        required: true,
        unique: true // One budget per user for simplicity in this demo
    },
    totalBudget: {
        type: Number,
        required: true
    },
    expenses: [ExpenseSchema],
    tripStartDate: { // Added for "Safe to Spend" daily calc
        type: Date
    },
    tripEndDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);
