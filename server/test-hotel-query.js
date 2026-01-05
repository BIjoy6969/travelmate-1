const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const run = async () => {
    console.log('--- Testing Travel Advisor API ---');
    console.log('Host:', process.env.RAPIDAPI_HOST_TRIPADVISOR);

    // Test 1: "hotels in Dhaka"
    try {
        console.log('\n[Test 1] Query: "hotels in Dhaka"');
        const res1 = await axios.get(`https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`, {
            params: { query: 'hotels in Dhaka', limit: '5' },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR
            }
        });
        console.log('Status:', res1.status);
        console.log('Data Items:', res1.data.data ? res1.data.data.length : 'N/A');
        if (res1.data.data && res1.data.data.length > 0) {
            console.log('First Item Name:', res1.data.data[0].name);
            console.log('First Item Type:', res1.data.data[0].result_type);
        }
    } catch (e) {
        console.log('Error Test 1:', e.message);
        if (e.response) console.log('Response:', e.response.status, JSON.stringify(e.response.data));
    }

    // Test 2: Just "Dhaka"
    try {
        console.log('\n[Test 2] Query: "Dhaka"');
        const res2 = await axios.get(`https://${process.env.RAPIDAPI_HOST_TRIPADVISOR}/locations/search`, {
            params: { query: 'Dhaka', limit: '5' },
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': process.env.RAPIDAPI_HOST_TRIPADVISOR
            }
        });
        console.log('Status:', res2.status);
        console.log('Data Items:', res2.data.data ? res2.data.data.length : 'N/A');
    } catch (e) {
        console.log('Error Test 2:', e.message);
    }
};

run();
