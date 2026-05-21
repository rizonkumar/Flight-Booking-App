const MESSAGES = {
    SUCCESS: {
        GATEWAY_RUNNING: 'API Gateway is running',
        HEALTH_CHECK: 'API Gateway health check passed',
    },
    ERROR: {
        NOT_FOUND: 'The requested resource was not found',
        INTERNAL_SERVER_ERROR: 'Something went wrong on the server',
        UNAUTHORIZED: 'Authentication required',
        FORBIDDEN: 'Access denied',
        PROXY_ERROR: 'Error communicating with the upstream service',
        SERVICE_UNAVAILABLE: 'The requested service is currently unavailable',
    },
};

const ROLES = {
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
};

module.exports = {
    MESSAGES,
    ROLES,
};
