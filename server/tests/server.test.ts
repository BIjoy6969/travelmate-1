import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/User';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.disconnect(); // Ensure we disconnect from any existing default connection
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth Endpoints', () => {
    let accessToken: string;
    let cookie: string;

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('accessToken');
        accessToken = res.body.accessToken;

        // Check for cookie
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        // cookie = cookies.find((c: string) => c.startsWith('jwt='));
        // Actually supertest manages cookies differently, but for manual check:
        expect(cookies[0]).toMatch(/jwt=/);
    });

    it('should login', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
        accessToken = res.body.accessToken;
    });

    it('should not access protected route without token', async () => {
        const res = await request(app)
            .get('/api/destinations');
        expect(res.statusCode).toEqual(401);
    });

    it('should create a destination with token', async () => {
        const res = await request(app)
            .post('/api/destinations')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
                name: 'Google Sydney',
                address: 'Pyrmont NSW, Australia',
                lat: -33.866651,
                lng: 151.195827,
                notes: 'Must visit!'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.name).toEqual('Google Sydney');
    });

    it('should get destinations', async () => {
        const res = await request(app)
            .get('/api/destinations')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });
});
