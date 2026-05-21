const jwt = require('jsonwebtoken');
const { ServerConfig } = require('../../config');
const AppError = require('../errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { MESSAGES } = require('../constants');

function generateToken(payload) {
    return jwt.sign(payload, ServerConfig.JWT_SECRET, {
        expiresIn: ServerConfig.JWT_EXPIRY,
    });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, ServerConfig.JWT_SECRET);
    } catch (error) {
        throw new AppError(
            MESSAGES.ERROR.INVALID_TOKEN,
            StatusCodes.UNAUTHORIZED,
            error.message
        );
    }
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, ServerConfig.JWT_SECRET, {
        expiresIn: ServerConfig.REFRESH_TOKEN_EXPIRY,
    });
}

module.exports = {
    generateToken,
    verifyToken,
    generateRefreshToken,
};
