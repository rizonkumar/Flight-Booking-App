const { StatusCodes } = require('http-status-codes');
const { verifyToken } = require('../utils/helpers/jwt-helper');
const { ErrorResponse } = require('../utils/common');
const { MESSAGES } = require('../utils/constants');

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const response = ErrorResponse();
            response.message = MESSAGES.ERROR.NO_TOKEN_PROVIDED;
            response.error = { explanation: 'Authorization header with Bearer token is required' };
            return res.status(StatusCodes.UNAUTHORIZED).json(response);
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        const response = ErrorResponse();
        response.message = MESSAGES.ERROR.INVALID_TOKEN;
        response.error = { explanation: error.message };
        return res.status(StatusCodes.UNAUTHORIZED).json(response);
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            const response = ErrorResponse();
            response.message = MESSAGES.ERROR.FORBIDDEN;
            response.error = { explanation: 'You do not have the required role to access this resource' };
            return res.status(StatusCodes.FORBIDDEN).json(response);
        }
        next();
    };
}

module.exports = {
    authenticate,
    authorize,
};
