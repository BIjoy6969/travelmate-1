import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Budget from '../models/Budget';
import Favorite from '../models/Favorite';

const router = express.Router();

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || process.env.travelmate || "travelmate";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

router.post('/', async (req: Request, res: Response) => {
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

    } catch (err: any) {
        console.error("Gemini API Error Detail:", JSON.stringify(err, null, 2));
        console.error("API Key present:", !!apiKey);
        // Return a 'reply' even in error so frontend displays it naturally instead of crashing
        res.json({ reply: "I'm having a bit of trouble connecting to my brain (Google Gemini). Please check the API Key or try again later." });
    }
});

export default router;
