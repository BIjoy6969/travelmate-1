const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateItinerary = async (req, res) => {
    const { destination, days, interests } = req.body;

    if (!destination || !days) {
        return res.status(400).json({ message: 'Destination and days are required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Updated model to gemini-2.5-flash as requested
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Create a ${days}-day travel itinerary for ${destination}. 
        Interests: ${interests || 'General'}. 
        Response MUST be valid JSON.
        Structure: { "title": "Trip Title", "days": [ { "dayNumber": 1, "theme": "Theme", "activities": ["Activity 1", "Activity 2"] } ] }
        Rules:
        1. No markdown formatting.
        2. No trailing commas.
        3. No comments.
        4. Escape all quotes within strings.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1) {
            const jsonText = text.substring(startIndex, endIndex + 1);
            try {
                const itinerary = JSON.parse(jsonText);
                res.json(itinerary);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError.message);
                console.error('Raw JSON Text:', jsonText);
                res.status(500).json({ message: 'AI returned invalid JSON', error: parseError.message });
            }
        } else {
            console.error('No JSON found in response:', text);
            throw new Error('No valid JSON found in response');
        }

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({
            message: 'Failed to generate itinerary from AI',
            error: error.message
        });
    }
};
