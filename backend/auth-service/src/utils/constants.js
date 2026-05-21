const MESSAGES = {
    SUCCESS: {
        SIGNUP: 'User registered successfully',
        SIGNIN: 'User signed in successfully',
        REFRESH_TOKEN: 'Token refreshed successfully',
        USER_FETCHED: 'User fetched successfully',
        HEALTH_CHECK: 'Auth API is live',
    },
    ERROR: {
        USER_ALREADY_EXISTS: 'A user with this email already exists',
        USER_NOT_FOUND: 'No user found with the provided email',
        INVALID_PASSWORD: 'Invalid password provided',
        INVALID_TOKEN: 'Invalid or expired token',
        NO_TOKEN_PROVIDED: 'No authentication token provided',
        UNAUTHORIZED: 'You are not authorized to access this resource',
        FORBIDDEN: 'You do not have permission to perform this action',
        INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later',
        VALIDATION_ERROR: 'Validation failed',
        RESOURCE_NOT_FOUND: 'Resource not found',
    },
};

module.exports = { MESSAGES };
