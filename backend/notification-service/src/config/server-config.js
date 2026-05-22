const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
  PORT: process.env.NOTIFICATION_SERVICE_PORT || 7001,
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  GMAIL_SMTP_EMAIL: process.env.GMAIL_SMTP_EMAIL,
  GMAIL_SMTP_PASSWORD: process.env.GMAIL_SMTP_PASSWORD
};
