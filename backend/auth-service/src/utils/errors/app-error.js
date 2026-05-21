class AppError extends Error {
    constructor(message, statusCode, explanation) {
        super(message);
        this.statusCode = statusCode;
        this.explanation = explanation;
        this.name = 'AppError';
    }
}

module.exports = AppError;
