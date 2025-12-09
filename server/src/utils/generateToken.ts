import jwt from 'jsonwebtoken';
import { Response } from 'express';

const generateTokens = (res: Response, userId: string) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT Secrets not defined');
    }

    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken, refreshToken };
};

export default generateTokens;
