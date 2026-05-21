const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');

const { ServerConfig, Logger } = require('./config');
const { generalLimiter } = require('./middlewares');
const routes = require('./routes');
const { MESSAGES } = require('./utils/constants');

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS — Permissive for development ──────────────────────────────────────
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
}));

// ─── Request Logging ─────────────────────────────────────────────────────────
app.use(morgan('combined'));

// ─── Global Rate Limiter ─────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Mount Routes ────────────────────────────────────────────────────────────
app.use(routes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: MESSAGES.ERROR.NOT_FOUND,
        data: {},
        error: {
            statusCode: StatusCodes.NOT_FOUND,
            explanation: `Route ${req.method} ${req.originalUrl} does not exist on this gateway.`,
        },
    });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    Logger.error(err);

    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || MESSAGES.ERROR.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json({
        success: false,
        message,
        data: {},
        error: {
            statusCode,
            explanation: err.explanation || MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        },
    });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(ServerConfig.PORT, () => {
    Logger.info(`${MESSAGES.SUCCESS.GATEWAY_RUNNING} on port ${ServerConfig.PORT}`);
    Logger.info(`Proxying Flight-Service  → ${ServerConfig.FLIGHT_SERVICE}`);
    Logger.info(`Proxying Booking-Service → ${ServerConfig.BOOKING_SERVICE}`);
    Logger.info(`Proxying Auth-Service    → ${ServerConfig.AUTH_SERVICE}`);
});
