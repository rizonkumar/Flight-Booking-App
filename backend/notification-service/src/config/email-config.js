const nodemailer = require('nodemailer');
const serverConfig = require('./server-config');
const logger = require('./logger-config');

let transporter;


async function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const { GMAIL_SMTP_EMAIL, GMAIL_SMTP_PASSWORD } = serverConfig;

  if (GMAIL_SMTP_EMAIL && GMAIL_SMTP_PASSWORD) {
    logger.info('SMTP credentials found. Configuring transporter with provided credentials.');
    transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: GMAIL_SMTP_EMAIL,
        pass: GMAIL_SMTP_PASSWORD
      }
    });
  } else {
    logger.warn('No SMTP credentials in environment. Attempting to fall back to Nodemailer Ethereal test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      logger.info(`Ethereal Test Account generated successfully.`);
      logger.info(`Ethereal Username: ${testAccount.user}`);
      logger.info(`Ethereal Password: ${testAccount.pass}`);
      logger.info(`You can view sent emails at: https://ethereal.email`);

      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (err) {
      logger.error('Failed to create Ethereal SMTP test account. Falling back to Console Logger transport.', err);
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return transporter;
}

module.exports = {
  getTransporter
};
