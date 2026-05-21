const express = require('express');
const router = express.Router();

const { AuthController } = require('../../controllers');
const { ValidationMiddleware } = require('../../middlewares');

router.post('/signup', ValidationMiddleware.validateSignup, AuthController.signup);
router.post('/signin', ValidationMiddleware.validateSignin, AuthController.signin);
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;
