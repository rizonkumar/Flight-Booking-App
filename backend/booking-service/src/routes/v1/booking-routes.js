const express = require("express");
const router = express.Router();
const { BookingController } = require("../../controllers");
const { ValidationMiddleware } = require("../../middlewares");

router.post("/", ValidationMiddleware.validateBooking, BookingController.createBooking);

router.post("/payments", ValidationMiddleware.validatePayment, BookingController.makePayment);

module.exports = router;
