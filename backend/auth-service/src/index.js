const express = require('express');

const { ServerConfig, Logger } = require('./config');
const apiRoutes = require('./routes');
const db = require('./models');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    Logger.info(`Auth-Service started successfully on port ${ServerConfig.PORT}`);
    Logger.info(`Health check: http://localhost:${ServerConfig.PORT}/api/v1/info`);

    try {
        await db.sequelize.authenticate();
        Logger.info('Auth-Service database connected successfully');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@skyroute.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        const existingAdmin = await db.User.findOne({ where: { email: adminEmail } });
        if (!existingAdmin) {
            await db.User.create({
                email: adminEmail,
                password: adminPassword,
                firstName: 'System',
                lastName: 'Admin',
                role: 'admin'
            });
            Logger.info(`Successfully seeded Admin user: ${adminEmail}`);
        } else {
            Logger.info(`Admin user check: already exists (${adminEmail})`);
        }
    } catch (err) {
        Logger.error(`Error during Auth-Service initialization: ${err.message}`);
    }
});
