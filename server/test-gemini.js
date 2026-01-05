const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');

// Create log file immediately
fs.writeFileSync('gemini_debug.log', '--- Script Started ---\n');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('gemini_debug.log', msg + '\n');
};

try {
    dotenv.config(); // Load ENV
    if (!process.env.GEMINI_API_KEY) {
        log('ERROR: GEMINI_API_KEY is missing in .env');
        process.exit(1);
    }
} catch (e) {
    log(`ERROR loading .env: ${e.message}`);
}

async function testGemini() {
    log('--- Starting Gemini Test ---');
    log(`API Key present: ${!!process.env.GEMINI_API_KEY}`);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try the standard model first
        const modelName = "gemini-pro";
        log(`Testing model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        log(`Success! Response: ${response.text()}`);

    } catch (error) {
        log('--- Gemini Error Occurred ---');
        log(`Error Message: ${error.message}`);
        if (error.response) {
            log(`Status: ${error.response.status}`);
            log(`Data: ${JSON.stringify(error.response.data || {}, null, 2)}`);
        }
    }
}

testGemini().catch(e => log(`Unhandled Rejection: ${e.message}`));
