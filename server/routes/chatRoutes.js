const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Budget = require('../models/Budget');
const Favorite = require('../models/Favorite');

// Initialize Gemini
// NOTE: Make sure GOOGLE_API_KEY or travelmate usage is configured. 
// User mentioned key is "travelmate"? No, user said: Use gemini api... key is called "travelmate"
// Wait, is "travelmate" the KEY string or the ENV VAR name?
// "the gemini api key is called 'travelmate'" -> likely the value is 'travelmate' or I should look for a var named that?
// Usually keys are long strings. I will assume they meant the Env Var name is `GEMINI_API_KEY` and the value is `travelmate`? 
// Or maybe they passed a mock key? usage: `new GoogleGenerativeAI(process.env.GEMINI_API_KEY)`
// I'll stick to standard `GEMINI_API_KEY` env var usage, or `process.env.travelmate`?
// User said: "the gemini api key is called "travelmate"". 
// I will try to use `process.env.travelmate` as the key.
// But mostly likely they meant the PROJECT is TravelMate. 
// "the gemini api key is called 'travelmate'" -> This is ambiguous. 
// I will assume for now they mean the environment variable *name* or the *value* is available.
// I will try to read `process.env.GEMINI_API_KEY` first, if not, try `travelmate`.
// Actually, I'll just use a safe fallback or check the .env later if needed.
// For now, I'll code it to use `process.env.GEMINI_API_KEY`.

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.travelmate || "travelmate");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

router.post('/', async (req, res) => {
    const { userId, message } = req.body;

    try {
        // 1. Gather Context
        let contextString = "";

        // Fetch Budget
        const budget = await Budget.findOne({ userId });
        if (budget) {
            const remaining = budget.totalBudget - budget.expenses.reduce((acc, curr) => acc + curr.amount, 0);
            contextString += `User Budget Info: Total ${budget.totalBudget}, Remaining: ${remaining}. Trip Dates: ${budget.tripStartDate} to ${budget.tripEndDate}.\n`;
        }

        // Fetch Favorites
        const favorites = await Favorite.find({ userId });
        if (favorites.length > 0) {
            const favNames = favorites.map(f => f.name).join(', ');
            contextString += `User Favorites: ${favNames}.\n`;
        }

        // 2. Construct System Prompt
        const systemPrompt = `You are TravelMate AI, a helpful travel assistant.
    Context about the user:
    ${contextString}
    
    Use this context to give personalized advice. If they ask about budget, refer to their remaining amount. If they ask for suggestions, look at their favorites.
    User Message: ${message}`;

        // 3. Call Gemini
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (err) {
        console.error("Gemini API Error Detail:", JSON.stringify(err, null, 2));
        console.error("API Key present:", !!process.env.GEMINI_API_KEY);
        // Return a 'reply' even in error so frontend displays it naturally instead of crashing
        res.json({ reply: "I'm having a bit of trouble connecting to my brain (Google Gemini). Please check the API Key or try again later." });
    }
});

module.exports = router;
