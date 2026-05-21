const express = require('express');

const { ServerConfig, Logger } = require('./config');
const apiRoutes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    Logger.info(`Auth-Service started successfully on port ${ServerConfig.PORT}`);
    Logger.info(`Health check: http://localhost:${ServerConfig.PORT}/api/v1/info`);
});
