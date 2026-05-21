const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const Logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat
    ),
    defaultMeta: { service: 'api-gateway' },
    transports: [
        new transports.Console({
            format: combine(colorize(), customFormat),
        }),
        new transports.File({ filename: 'combined.log' }),
    ],
});

module.exports = Logger;
