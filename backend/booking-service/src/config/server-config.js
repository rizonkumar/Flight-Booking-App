const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

module.exports = {
  PORT: process.env.BOOKING_SERVICE_PORT,
  FLIGHT_SERVICE: process.env.FLIGHT_SERVICE,
  AUTH_SERVICE: process.env.AUTH_SERVICE || "http://localhost:5001",
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
};
