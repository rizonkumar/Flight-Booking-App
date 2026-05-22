const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const ServerConfig = {
  PORT: process.env.FLIGHT_SERVICE_PORT,
};

module.exports = { ServerConfig };
