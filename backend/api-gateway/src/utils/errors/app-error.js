const { StatusCodes } = require('http-status-codes');

class AppError extends Error {
    constructor(name, message, explanation, statusCode) {
        super(message);
        this.name = name;
        this.message = message;
        this.explanation = explanation;
        this.statusCode = statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    }
}

module.exports = AppError;
