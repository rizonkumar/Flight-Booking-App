const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');

const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again after 1 minute',
        data: {},
        error: {
            statusCode: StatusCodes.TOO_MANY_REQUESTS,
            explanation: 'Rate limit exceeded. You have made too many requests in a short period.',
        },
    },
});

const bookingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Booking rate limit exceeded. You can only make 20 booking requests per minute.',
        data: {},
        error: {
            statusCode: StatusCodes.TOO_MANY_REQUESTS,
            explanation: 'Booking rate limit exceeded. Please wait before making another booking request.',
        },
    },
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 1 minute',
        data: {},
        error: {
            statusCode: StatusCodes.TOO_MANY_REQUESTS,
            explanation: 'Authentication rate limit exceeded to prevent brute force attacks.',
        },
    },
});

module.exports = {
    generalLimiter,
    bookingLimiter,
    authLimiter,
};
