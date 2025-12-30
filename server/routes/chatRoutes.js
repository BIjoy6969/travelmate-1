const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    try {
        console.log("Chat Request received. Message:", message);
        console.log("History length:", history ? history.length : 0);

        // Use a model suitable for chat
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Validate history: API expects alternating User/Model, starting with User ideally.
        // If history starts with Model, we might need to adjust or prepend a dummy User message,
        // OR just rely on the SDK/API to handle it (which it often rejects).
        // For sanity, let's try to ensure safety.

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                // No token limit, let the model finish naturally
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        console.log("Chat Response generated successfully.");
        res.json({ reply: text });
    } catch (err) {
        console.error("Gemini Chat Error Details:", err);
        console.error("Error Message:", err.message);
        res.status(500).json({ message: "Failed to get response from AI.", error: err.message });
    }
});

module.exports = router;

