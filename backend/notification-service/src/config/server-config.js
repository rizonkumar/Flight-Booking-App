const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 7000,
  REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  GMAIL_SMTP_EMAIL: process.env.GMAIL_SMTP_EMAIL,
  GMAIL_SMTP_PASSWORD: process.env.GMAIL_SMTP_PASSWORD
};
