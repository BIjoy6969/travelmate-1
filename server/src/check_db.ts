import 'dotenv/config';
import mongoose from 'mongoose';

console.log('--- DIAGNOSTIC START ---');
console.log('Current Directory:', process.cwd());
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET exists:', !!process.env.JWT_REFRESH_SECRET);

if (!process.env.MONGO_URI) {
    console.error('CRITICAL: MONGO_URI is missing!');
    process.exit(1);
}

const connect = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('SUCCESS: MongoDB Connected!');
        console.log('Connection Host:', mongoose.connection.host);

        // Check if we can write a dummy document to verify permissions
        const collection = mongoose.connection.collection('system_health_check');
        await collection.insertOne({ status: 'ok', date: new Date() });
        console.log('SUCCESS: Write permission verified.');

        await mongoose.connection.close();
        console.log('Connection closed.');
    } catch (error: any) {
        console.error('ERROR: MongoDB Connection Failed!');
        console.error(error);
    }
};

connect();
