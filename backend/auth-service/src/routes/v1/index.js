const express = require('express');
const router = express.Router();

const authRoutes = require('./auth-routes');
const { InfoController } = require('../../controllers');

router.use('/auth', authRoutes);
router.get('/info', InfoController.info);

module.exports = router;
