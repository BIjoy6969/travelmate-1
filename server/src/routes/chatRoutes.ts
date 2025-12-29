import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Budget from '../models/Budget';
import Favorite from '../models/Favorite';

const router = express.Router();

// Initialize Gemini
// NOTE: Using process.env.GEMINI_API_KEY as standard, fallback to 'travelmate' if env var name is 'travelmate'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.travelmate || "travelmate");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated model name to current valid one if 'gemini-flash-latest' is old, but keeping logic similar

router.post('/', async (req: Request, res: Response) => {
    const { userId, message } = req.body;

    try {
        // 1. Gather Context
        let contextString = "";

        // Fetch Budget
        const budget = await Budget.findOne({ userId });
        if (budget) {
            const expensesSum = budget.expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);
            const remaining = budget.totalBudget - expensesSum;
            contextString += `User Budget Info: Total ${budget.totalBudget}, Remaining: ${remaining}. Trip Dates: ${budget.tripStartDate} to ${budget.tripEndDate}.\n`;
        }

        // Fetch Favorites
        const favorites = await Favorite.find({ userId });
        if (favorites.length > 0) {
            const favNames = favorites.map((f: any) => f.name).join(', ');
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
        // Return a 'reply' even in error so frontend displays it naturally instead of crashing
        res.json({ reply: "I'm having a bit of trouble connecting to my brain (Google Gemini). Please check the API Key or try again later." });
    }
});

export default router;
