const { z } = require('zod');
const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');
const { MESSAGES } = require('../utils/constants');

const signupSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
});

const signinSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

function validateRequest(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            const response = ErrorResponse();
            response.message = MESSAGES.ERROR.VALIDATION_ERROR;
            response.error = {
                explanation: error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            };
            return res.status(StatusCodes.BAD_REQUEST).json(response);
        }
    };
}

const validateSignup = validateRequest(signupSchema);
const validateSignin = validateRequest(signinSchema);

module.exports = {
    validateSignup,
    validateSignin,
    validateRequest,
};
