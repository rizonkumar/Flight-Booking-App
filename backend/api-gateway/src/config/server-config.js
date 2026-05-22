const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
    PORT: process.env.API_GATEWAY_PORT || 6000,
    FLIGHT_SERVICE: process.env.FLIGHT_SERVICE || 'http://localhost:3000',
    BOOKING_SERVICE: process.env.BOOKING_SERVICE || 'http://localhost:4000',
    AUTH_SERVICE: process.env.AUTH_SERVICE || 'http://localhost:5001',
    JWT_SECRET: process.env.JWT_SECRET || 'flight_booking_jwt_secret_key_2024',
};
