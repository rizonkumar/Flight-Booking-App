const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { StatusCodes } = require('http-status-codes');

const { ServerConfig, Logger } = require('../config');
const { authenticate, authorize, authLimiter, bookingLimiter } = require('../middlewares');
const { ROLES, MESSAGES } = require('../utils/constants');

const router = express.Router();

/**
 * Helper to create a proxy middleware for a given target service.
 * - changeOrigin ensures the Host header matches the target.
 * - x-user-id and x-user-role headers set by auth middleware are forwarded automatically
 *   since they are already on req.headers before the proxy fires.
 */
const createServiceProxy = (target, pathRewrite) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite,
        on: {
            proxyReq: (proxyReq, req) => {
                // Forward user identity headers set by auth middleware
                if (req.headers['x-user-id']) {
                    proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
                }
                if (req.headers['x-user-role']) {
                    proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
                }
            },
            error: (err, req, res) => {
                Logger.error(`Proxy error: ${err.message}`);
                if (!res.headersSent) {
                    res.status(StatusCodes.BAD_GATEWAY).json({
                        success: false,
                        message: MESSAGES.ERROR.PROXY_ERROR,
                        data: {},
                        error: {
                            statusCode: StatusCodes.BAD_GATEWAY,
                            explanation: MESSAGES.ERROR.SERVICE_UNAVAILABLE,
                        },
                    });
                }
            },
        },
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES — No authentication required
// ─────────────────────────────────────────────────────────────────────────────
const authRouter = express.Router();

const authProxy = createServiceProxy(ServerConfig.AUTH_SERVICE, {
    '^/api/v1/auth': '/api/v1',
});

authRouter.post('/signup', authLimiter, authProxy);
authRouter.post('/signin', authLimiter, authProxy);
authRouter.post('/refresh-token', authLimiter, authProxy);

router.use('/api/v1/auth', authRouter);

// ─────────────────────────────────────────────────────────────────────────────
// FLIGHT ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const flightRouter = express.Router();

const flightServiceProxy = createServiceProxy(ServerConfig.FLIGHT_SERVICE);

// GET routes — any authenticated role
flightRouter.get('/', authenticate, flightServiceProxy);
flightRouter.get('/:id', authenticate, flightServiceProxy);

// POST — ADMIN only
flightRouter.post('/', authenticate, authorize(ROLES.ADMIN), flightServiceProxy);

// PATCH seats — ADMIN only
flightRouter.patch('/:id/seats', authenticate, authorize(ROLES.ADMIN), flightServiceProxy);

router.use('/api/v1/flights', flightRouter);

// ─────────────────────────────────────────────────────────────────────────────
// AIRPLANE ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const airplaneRouter = express.Router();

const airplaneServiceProxy = createServiceProxy(ServerConfig.FLIGHT_SERVICE);

// GET routes — any authenticated role
airplaneRouter.get('/', authenticate, airplaneServiceProxy);
airplaneRouter.get('/:id', authenticate, airplaneServiceProxy);

// POST — ADMIN only
airplaneRouter.post('/', authenticate, authorize(ROLES.ADMIN), airplaneServiceProxy);

// PATCH — ADMIN only
airplaneRouter.patch('/:id', authenticate, authorize(ROLES.ADMIN), airplaneServiceProxy);

// DELETE — ADMIN only
airplaneRouter.delete('/:id', authenticate, authorize(ROLES.ADMIN), airplaneServiceProxy);

router.use('/api/v1/airplanes', airplaneRouter);

// ─────────────────────────────────────────────────────────────────────────────
// AIRPORT ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const airportRouter = express.Router();

const airportServiceProxy = createServiceProxy(ServerConfig.FLIGHT_SERVICE);

// GET routes — any authenticated role
airportRouter.get('/', authenticate, airportServiceProxy);
airportRouter.get('/:id', authenticate, airportServiceProxy);

// POST — ADMIN only
airportRouter.post('/', authenticate, authorize(ROLES.ADMIN), airportServiceProxy);

// DELETE — ADMIN only
airportRouter.delete('/:id', authenticate, authorize(ROLES.ADMIN), airportServiceProxy);

router.use('/api/v1/airports', airportRouter);

// ─────────────────────────────────────────────────────────────────────────────
// CITY ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const cityRouter = express.Router();

const cityServiceProxy = createServiceProxy(ServerConfig.FLIGHT_SERVICE);

// GET routes — any authenticated role
cityRouter.get('/', authenticate, cityServiceProxy);
cityRouter.get('/:id', authenticate, cityServiceProxy);

// POST — ADMIN only
cityRouter.post('/', authenticate, authorize(ROLES.ADMIN), cityServiceProxy);

// PATCH — ADMIN only
cityRouter.patch('/:id', authenticate, authorize(ROLES.ADMIN), cityServiceProxy);

// DELETE — ADMIN only
cityRouter.delete('/:id', authenticate, authorize(ROLES.ADMIN), cityServiceProxy);

router.use('/api/v1/cities', cityRouter);

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING ROUTES
// ─────────────────────────────────────────────────────────────────────────────
const bookingRouter = express.Router();

const bookingServiceProxy = createServiceProxy(ServerConfig.BOOKING_SERVICE);

// POST bookings — any authenticated role, with booking rate limiter
bookingRouter.post('/', authenticate, bookingLimiter, bookingServiceProxy);

// POST payment — any authenticated role, with booking rate limiter
bookingRouter.post('/payment', authenticate, bookingLimiter, bookingServiceProxy);

router.use('/api/v1/bookings', bookingRouter);

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
router.get('/api/v1/info', async (req, res) => {
    const checkService = async (name, url) => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const response = await fetch(`${url}/api/v1/info`, { signal: controller.signal });
            clearTimeout(timeout);
            return { name, status: response.ok ? 'healthy' : 'unhealthy', statusCode: response.status };
        } catch (error) {
            return { name, status: 'unreachable', error: error.message };
        }
    };

    const services = await Promise.all([
        checkService('Flight-Service', ServerConfig.FLIGHT_SERVICE),
        checkService('Booking-Service', ServerConfig.BOOKING_SERVICE),
        checkService('Auth-Service', ServerConfig.AUTH_SERVICE),
    ]);

    return res.status(StatusCodes.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.HEALTH_CHECK,
        data: {
            gateway: {
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
            services,
        },
        error: {},
    });
});

module.exports = router;
