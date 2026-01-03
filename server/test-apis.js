const dotenv = require('dotenv');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const util = require('util');

dotenv.config();

const logFile = fs.createWriteStream('diagnostic.log', { flags: 'w' });
const logStdout = process.stdout;

console.log = function (...args) {
    const msg = util.format(...args) + '\n';
    logFile.write(msg);
    logStdout.write(msg);
};
console.error = function (...args) {
    const msg = util.format(...args) + '\n';
    logFile.write(msg);
    logStdout.write(msg);
};

async function testGemini() {
    console.log('--- Testing Gemini API ---');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Say Hello");
        const response = await result.response;
        console.log('Gemini Success:', response.text());
    } catch (error) {
        console.error('Gemini Failed:', error.message);
    }
}

async function testTripAdvisor() {
    console.log('\n--- Testing TripAdvisor API ---');
    try {
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`,
            params: { query: 'paris', limit: '1', currency: 'USD', sort: 'relevance', lang: 'en_US' },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR
            }
        };
        const response = await axios.request(options);
        console.log('TripAdvisor Success. Data items:', response.data.data ? response.data.data.length : 'No data array');
        if (response.data.data && response.data.data.length > 0) {
            console.log('First item name:', response.data.data[0].name);
        } else {
            console.log('Full Response Truncated:', JSON.stringify(response.data).substring(0, 500));
        }
    } catch (error) {
        console.error('TripAdvisor Failed:', error.message);
        if (error.response) console.error('Response Status:', error.response.status, 'Data:', error.response.data);
    }
}

async function testHotels() {
    console.log('\n--- Testing Booking.com API ---');
    try {
        const options = {
            method: 'GET',
            url: `https://${process.env.RAPIDAPI_HOST_HOTELS}/locations/auto-complete`,
            params: { text: 'Paris', languagecode: 'en-us' },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_HOTELS
            }
        };
        const response = await axios.request(options);
        console.log('Booking.com Success. Data items:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    } catch (error) {
        console.error('Booking.com Failed:', error.message);
        if (error.response) console.error('Response Status:', error.response.status, 'Data:', error.response.data);
    }
}

(async () => {
    try {
        await testGemini();
    } catch (e) { console.error('Gemini Wrapper Error:', e); }

    try {
        await testTripAdvisor();
    } catch (e) { console.error('TripAdvisor Wrapper Error:', e); }

    try {
        await testHotels();
    } catch (e) { console.error('Hotels Wrapper Error:', e); }
})();
