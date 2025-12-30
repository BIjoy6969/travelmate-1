const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// Get Budgets for User (Returns all)
router.get('/:userId', async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
        // Return latest for backward compatibility if needed, or array
        // For now, let's returns the array so frontend can decide
        res.json(budgets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Specific Budget by Destination (for Favorites integration)
router.get('/trip/:userId/:destination', async (req, res) => {
    try {
        const budget = await Budget.findOne({
            userId: req.params.userId,
            destination: req.params.destination
        });
        if (!budget) return res.status(404).json({ message: "Trip not found" });
        res.json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or Update Budget (Trip Plan)
router.post('/', async (req, res) => {
    const { userId, destination, destinationId, totalBudget, tripStartDate, tripEndDate, estimatedBreakdown, itinerary, travelStyle } = req.body;
    try {
        // Find existing trip for this destination
        let budget = await Budget.findOne({ userId, destination });

        if (budget) {
            budget.totalBudget = totalBudget || budget.totalBudget;
            budget.tripStartDate = tripStartDate || budget.tripStartDate;
            budget.tripEndDate = tripEndDate || budget.tripEndDate;
            budget.estimatedBreakdown = estimatedBreakdown || budget.estimatedBreakdown;
            budget.itinerary = itinerary || budget.itinerary;
            budget.travelStyle = travelStyle || budget.travelStyle;
            if (destinationId) budget.destinationId = destinationId;
            await budget.save();
        } else {
            budget = new Budget({
                userId,
                destination,
                destinationId,
                totalBudget,
                tripStartDate,
                tripEndDate,
                estimatedBreakdown,
                itinerary,
                travelStyle
            });
            await budget.save();
        }
        res.json(budget);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update Specific Budget (Manual Edits)
router.put('/:id', async (req, res) => {
    try {
        const budget = await Budget.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(budget);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add Expense (Actual)
router.post('/:userId/expenses', async (req, res) => {
    const { category, amount, description, date } = req.body;
    try {
        // Default to most recent budget if not specified
        // Logic simplified for demo
        const budget = await Budget.findOne({ userId: req.params.userId }).sort({ updatedAt: -1 });
        if (!budget) return res.status(404).json({ message: "Budget not found" });

        budget.expenses.push({ category, amount, description, date });
        await budget.save();
        res.json(budget);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Expense
router.delete('/:userId/expenses/:expenseId', async (req, res) => {
    try {
        const budget = await Budget.findOne({ "expenses._id": req.params.expenseId });
        if (!budget) return res.status(404).json({ message: "Budget not found" });

        budget.expenses = budget.expenses.filter(exp => exp._id.toString() !== req.params.expenseId);
        await budget.save();
        res.json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Budget Estimator
router.post('/generate', async (req, res) => {
    const { destination, travelStyle, tripStartDate, tripEndDate, customPrompt } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Generate a travel budget and itinerary for a trip to ${destination}.
        Travel Style: ${travelStyle}
        Dates: ${tripStartDate} to ${tripEndDate}
        ${customPrompt ? `Additional Requirements: ${customPrompt}` : ''}
        
        Return a JSON object with:
        1. "totalEstimatedCost": number
        2. "breakdown": array of { "category": string (Food, Transport, Lodging, Activities, Shopping, Other), "amount": number, "description": string }
        3. "itinerary": array of { "day": number, "activities": array of strings, "estimatedCost": number }
        
        Only return the JSON object, no other text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up the response if it contains markdown code blocks
        text = text.replace(/```json|```/g, "").trim();

        const aiData = JSON.parse(text);

        res.json(aiData);
    } catch (err) {
        console.error("Gemini Error:", err);
        if (err.status === 429) {
            res.status(429).json({
                message: "Gemini API quota exceeded. Please wait a few minutes or check your billing plan.",
                quotaExceeded: true
            });
        } else if (err.status === 404) {
            res.status(500).json({
                message: "AI model not available. Please try again later.",
                modelError: true
            });
        } else {
            res.status(500).json({ message: "Failed to generate AI budget. Please try again." });
        }
    }
});

module.exports = router;
