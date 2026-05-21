const express = require('express');
const { ServerConfig, Logger } = require('./config');
const { StatusCodes } = require('http-status-codes');

const emailQueue = require('./workers/email-worker');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  Logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.get('/api/v1/info', (req, res) => {
  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Notification Service is live',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  Logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Something went wrong inside the Notification Service',
    error: err.message
  });
});

app.listen(ServerConfig.PORT, () => {
  Logger.info(`Notification Service is up and running on port ${ServerConfig.PORT}`);
  Logger.info(`Worker listening on queue: ${emailQueue.name}`);
});
