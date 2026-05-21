const { StatusCodes } = require("http-status-codes");
const { MESSAGES } = require("../utils/constants");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { BookingService } = require("../services");

async function createBooking(req, res) {
  try {
    const booking = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.body.userId,
      noofSeats: req.body.noofSeats,
    });
    const response = SuccessResponse();
    response.data = booking;
    response.message = MESSAGES.SUCCESS.BOOKING_CREATED;
    return res.status(StatusCodes.CREATED).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = error.explanation || MESSAGES.ERROR.BOOKING_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function makePayment(req, res) {
  try {
    const booking = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: req.body.userId,
      bookingId: req.body.bookingId,
    });
    const response = SuccessResponse();
    response.data = booking;
    response.message = MESSAGES.SUCCESS.BOOKING_CREATED;
    return res.status(StatusCodes.CREATED).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = error.explanation || MESSAGES.ERROR.BOOKING_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}
module.exports = { createBooking, makePayment };
