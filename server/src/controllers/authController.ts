import { Request, Response } from 'express';
import User from '../models/User';
import generateTokens from '../utils/generateToken';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        const { accessToken, refreshToken } = generateTokens(res, (user._id as unknown) as string);

        // Save refresh token to user DB using findByIdAndUpdate to avoid VersionError
        await User.findByIdAndUpdate(user._id, {
            $push: { refreshTokens: refreshToken }
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const { accessToken, refreshToken } = generateTokens(res, (user._id as unknown) as string);

        // Rotate refresh tokens: keep last 5 or just add new one?
        // Let's just append for now, but in prod we might want to limit.
        await User.findByIdAndUpdate(user._id, {
            $push: { refreshTokens: refreshToken }
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req: Request, res: Response) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' });

    const user = await User.findOne({ refreshTokens: refreshToken });

    // Detected refresh token reuse!
    if (!user) {
        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET as string,
            async (err: any, decoded: any) => {
                if (err) return res.sendStatus(403);
                // Reuse detected: create security alert (not implemented) and delete all RTs?
                const hackedUser = await User.findById(decoded.userId);
                if (hackedUser) {
                    await User.findByIdAndUpdate(decoded.userId, { refreshTokens: [] });
                }
            }
        );
        return res.sendStatus(403); // Forbidden
    }

    const newRefreshTokenArray = user.refreshTokens.filter((rt) => rt !== refreshToken);

    jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
        async (err: any, decoded: any) => {
            if (err) {
                await User.findByIdAndUpdate(user._id, { refreshTokens: [...newRefreshTokenArray] });
            }
            if (err || user._id.toString() !== decoded.userId) return res.sendStatus(403);

            // Refresh token was still valid
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(res, (user._id as unknown) as string);

            await User.findByIdAndUpdate(user._id, {
                refreshTokens: [...newRefreshTokenArray, newRefreshToken]
            });

            res.json({ accessToken });
        }
    );
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    await User.findByIdAndUpdate(user._id, {
        $pull: { refreshTokens: refreshToken }
    });

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV !== 'development' });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/user/me
// @access  Private
const getUserProfile = async (req: Request, res: Response) => {
    const user = {
        _id: req.user?._id,
        name: req.user?.name,
        email: req.user?.email,
    };

    res.json(user);
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        user.name = req.body.name || user.name;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export { registerUser, loginUser, refreshToken, logoutUser, getUserProfile, updateUserProfile };
