import jwt from 'jsonwebtoken'; //jsonwebtoken is a library that provides tools for working with JSON Web Tokens (JWTs)
import { Response } from 'express'; //Response is a type that represents the response object from an Express.js server

const generateTokens = (res: Response, userId: string) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT Secrets not defined'); //throws an error if the JWT secrets are not defined
    }

    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15m', //accessToken expires in 15 minutes
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d', //refreshToken expires in 7 days
    });

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', //secure cookie is only sent over HTTPS
        sameSite: 'strict', //strict sameSite attribute prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken, refreshToken };
};

export default generateTokens;
