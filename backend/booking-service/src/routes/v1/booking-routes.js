const express = require("express");
const router = express.Router();
const { BookingController } = require("../../controllers");
const { ValidationMiddleware } = require("../../middlewares");

router.post("/", ValidationMiddleware.validateBooking, BookingController.createBooking);

router.post("/payments", ValidationMiddleware.validatePayment, BookingController.makePayment);

router.patch("/:id/cancel", BookingController.cancelBooking);

router.get("/:id/ticket", BookingController.downloadTicket);

module.exports = router;
