import { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateItinerary = async (req: Request, res: Response): Promise<void> => {
    const { destination, days, interests } = req.body;

    if (!destination || !days) {
        res.status(400).json({ message: 'Destination and days are required' });
        return;
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY || "travelmate";
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Create a ${days}-day travel itinerary for ${destination} with interests: ${interests || 'General'}.
        Response MUST be a raw JSON object. NO markdown, NO code blocks, NO text before or after.
        Format: { "title": "Trip Title", "days": [ { "dayNumber": 1, "theme": "Theme", "activities": ["Activity 1", "Activity 2"] } ] }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        // Improved cleaning
        let cleanedText = text;
        if (text.startsWith('```')) {
            cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        }

        const startIndex = cleanedText.indexOf('{');
        const endIndex = cleanedText.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1) {
            const jsonText = cleanedText.substring(startIndex, endIndex + 1);
            try {
                const itinerary = JSON.parse(jsonText);
                res.json(itinerary);
            } catch (parseError: any) {
                console.error('JSON Parse Error:', parseError.message);
                res.status(500).json({ message: 'AI returned invalid JSON structure', error: parseError.message });
            }
        } else {
            throw new Error('No valid JSON found in response');
        }

    } catch (error: any) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({
            message: 'Failed to generate itinerary from AI',
            error: error.message
        });
    }
};
