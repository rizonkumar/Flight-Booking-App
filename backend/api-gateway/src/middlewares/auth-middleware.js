const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const { ServerConfig } = require('../config');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required. Please provide a valid Bearer token.',
                data: {},
                error: {
                    statusCode: StatusCodes.UNAUTHORIZED,
                    explanation: 'Missing or malformed authorization header. Expected format: Bearer <token>',
                },
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, ServerConfig.JWT_SECRET);

        req.user = decoded;

        req.headers['x-user-id'] = String(decoded.id);
        req.headers['x-user-role'] = String(decoded.role);

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Token has expired. Please sign in again or use refresh token.',
                data: {},
                error: {
                    statusCode: StatusCodes.UNAUTHORIZED,
                    explanation: 'The provided JWT token has expired.',
                },
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid token. Please provide a valid authentication token.',
                data: {},
                error: {
                    statusCode: StatusCodes.UNAUTHORIZED,
                    explanation: 'The provided JWT token is invalid or malformed.',
                },
            });
        }

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'An error occurred during authentication.',
            data: {},
            error: {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                explanation: 'Something went wrong while verifying the token.',
            },
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied. User role information is missing.',
                data: {},
                error: {
                    statusCode: StatusCodes.FORBIDDEN,
                    explanation: 'User role could not be determined from the token.',
                },
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
                data: {},
                error: {
                    statusCode: StatusCodes.FORBIDDEN,
                    explanation: 'You do not have the required permissions to access this resource.',
                },
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize,
};
