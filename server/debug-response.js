const dotenv = require('dotenv');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

dotenv.config();

async function debugTripAdvisor() {
    console.log('Testing TripAdvisor...');
    try {
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`,
            params: {
                query: 'paris',
                limit: '5',
                currency: 'USD',
                sort: 'relevance',
                lang: 'en_US'
            },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR
            }
        };

        const response = await axios.request(options);
        // Write full response to file
        fs.writeFileSync('tripadvisor_response.json', JSON.stringify(response.data, null, 2));
        console.log('TripAdvisor: Response saved to tripadvisor_response.json');
    } catch (error) {
        console.error('TripAdvisor Error:');
        const errInfo = error.response ? { status: error.response.status, data: error.response.data } : { message: error.message };
        fs.writeFileSync('tripadvisor_error.json', JSON.stringify(errInfo, null, 2));
    }
}

async function debugGemini() {
    console.log('Testing Gemini...');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("List 3 fruits");
        const response = await result.response;
        const text = response.text();

        fs.writeFileSync('gemini_response.txt', text);
        console.log('Gemini: Response saved to gemini_response.txt');
    } catch (error) {
        console.error('Gemini Error:');
        fs.writeFileSync('gemini_error.txt', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
}

(async () => {
    await debugTripAdvisor();
    await debugGemini();
})();
