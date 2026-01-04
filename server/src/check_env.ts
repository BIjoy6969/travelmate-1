import 'dotenv/config';

console.log('--- ENV DIAGNOSTIC ---');
console.log('FLIGHT_API_KEY exists:', !!process.env.FLIGHT_API_KEY);
if (process.env.FLIGHT_API_KEY) {
    console.log('FLIGHT_API_KEY length:', process.env.FLIGHT_API_KEY.length);
    console.log('FLIGHT_API_KEY first 4 chars:', process.env.FLIGHT_API_KEY.substring(0, 4));
} else {
    console.error('FLIGHT_API_KEY is MISSING');
}
