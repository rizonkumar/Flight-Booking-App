const serverConfig = require('./server-config');
const logger = require('./logger-config');
const { getTransporter } = require('./email-config');

module.exports = {
  ServerConfig: serverConfig,
  Logger: logger,
  getTransporter
};
