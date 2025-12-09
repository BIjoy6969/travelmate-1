import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB Connected');

        await User.deleteMany({});
        console.log('Users cleared');

        const user = await User.create({
            name: 'Demo User',
            email: 'demo@example.com',
            password: 'Demo123!',
        });

        console.log(`User created: ${user.email}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
