const { StatusCodes } = require('http-status-codes');
const { UserRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { MESSAGES } = require('../utils/constants');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/helpers/jwt-helper');
const { Logger } = require('../config');

const userRepository = new UserRepository();

async function signup({ email, password, firstName, lastName }) {
    try {
        const existingUser = await userRepository.getUserByEmail(email);
        if (existingUser) {
            throw new AppError(
                MESSAGES.ERROR.USER_ALREADY_EXISTS,
                StatusCodes.CONFLICT,
                'A user with this email already exists'
            );
        }

        const user = await userRepository.create({ email, password, firstName, lastName });

        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = generateToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const userResponse = user.toJSON();
        delete userResponse.password;

        return {
            user: userResponse,
            tokens: {
                accessToken,
                refreshToken,
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        Logger.error(`AuthService signup error: ${error.message}`);
        throw new AppError(
            MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
}

async function signin({ email, password }) {
    try {
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new AppError(
                MESSAGES.ERROR.USER_NOT_FOUND,
                StatusCodes.NOT_FOUND,
                'No user found with the provided email'
            );
        }

        const isMatch = await user.isPasswordMatch(password);
        if (!isMatch) {
            throw new AppError(
                MESSAGES.ERROR.INVALID_PASSWORD,
                StatusCodes.UNAUTHORIZED,
                'Invalid password provided'
            );
        }

        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = generateToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const userResponse = user.toJSON();
        delete userResponse.password;

        return {
            user: userResponse,
            tokens: {
                accessToken,
                refreshToken,
            },
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        Logger.error(`AuthService signin error: ${error.message}`);
        throw new AppError(
            MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
}

async function refreshToken(refreshTokenString) {
    try {
        const decoded = verifyToken(refreshTokenString);

        const user = await userRepository.get(decoded.id);

        const payload = { id: user.id, email: user.email, role: user.role };
        const accessToken = generateToken(payload);

        return {
            accessToken,
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        Logger.error(`AuthService refreshToken error: ${error.message}`);
        throw new AppError(
            MESSAGES.ERROR.INVALID_TOKEN,
            StatusCodes.UNAUTHORIZED,
            error.message
        );
    }
}

async function getUserById(id) {
    try {
        const user = await userRepository.get(id);
        const userResponse = user.toJSON();
        delete userResponse.password;
        return userResponse;
    } catch (error) {
        if (error instanceof AppError) throw error;
        Logger.error(`AuthService getUserById error: ${error.message}`);
        throw new AppError(
            MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            error.message
        );
    }
}

module.exports = {
    signup,
    signin,
    refreshToken,
    getUserById,
};
