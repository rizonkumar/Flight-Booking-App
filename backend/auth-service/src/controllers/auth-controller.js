const { StatusCodes } = require('http-status-codes');
const { AuthService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');
const { MESSAGES } = require('../utils/constants');
const { Logger } = require('../config');

async function signup(req, res) {
    try {
        const result = await AuthService.signup(req.body);
        const response = SuccessResponse();
        response.message = MESSAGES.SUCCESS.SIGNUP;
        response.data = result;
        return res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        Logger.error(`AuthController signup error: ${error.message}`);
        const response = ErrorResponse();
        response.message = error.message || MESSAGES.ERROR.INTERNAL_SERVER_ERROR;
        response.error = { explanation: error.explanation || error.message };
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(response);
    }
}

async function signin(req, res) {
    try {
        const result = await AuthService.signin(req.body);
        const response = SuccessResponse();
        response.message = MESSAGES.SUCCESS.SIGNIN;
        response.data = result;
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        Logger.error(`AuthController signin error: ${error.message}`);
        const response = ErrorResponse();
        response.message = error.message || MESSAGES.ERROR.INTERNAL_SERVER_ERROR;
        response.error = { explanation: error.explanation || error.message };
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(response);
    }
}

async function refreshToken(req, res) {
    try {
        const { refreshToken: refreshTokenString } = req.body;
        if (!refreshTokenString) {
            const response = ErrorResponse();
            response.message = MESSAGES.ERROR.NO_TOKEN_PROVIDED;
            response.error = { explanation: 'Refresh token is required in the request body' };
            return res.status(StatusCodes.BAD_REQUEST).json(response);
        }
        const result = await AuthService.refreshToken(refreshTokenString);
        const response = SuccessResponse();
        response.message = MESSAGES.SUCCESS.REFRESH_TOKEN;
        response.data = result;
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        Logger.error(`AuthController refreshToken error: ${error.message}`);
        const response = ErrorResponse();
        response.message = error.message || MESSAGES.ERROR.INVALID_TOKEN;
        response.error = { explanation: error.explanation || error.message };
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(response);
    }
}

async function getUser(req, res) {
    try {
        const result = await AuthService.getUserById(req.params.id);
        const response = SuccessResponse();
        response.message = MESSAGES.SUCCESS.GET_USER || 'Successfully retrieved user details';
        response.data = result;
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        Logger.error(`AuthController getUser error: ${error.message}`);
        const response = ErrorResponse();
        response.message = error.message || MESSAGES.ERROR.INTERNAL_SERVER_ERROR;
        response.error = { explanation: error.explanation || error.message };
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(response);
    }
}

module.exports = {
    signup,
    signin,
    refreshToken,
    getUser,
};
