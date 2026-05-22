const { StatusCodes } = require("http-status-codes");
const { MESSAGES } = require("../utils/constants");
const { SuccessResponse, ErrorResponse, Enums } = require("../utils/common");
const { BookingService } = require("../services");
const axios = require("axios");
const { ServerConfig } = require("../config");
const { generateTicketPDF } = require("../utils/helpers/ticket-generator");

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

async function cancelBooking(req, res) {
  try {
    const isAdmin = req.headers["x-user-role"] === "admin";
    const result = await BookingService.cancelBooking(req.params.id, isAdmin);
    const response = SuccessResponse();
    response.data = result;
    response.message = "Booking successfully cancelled";
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = error.explanation || "Failed to cancel booking";
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function downloadTicket(req, res) {
  try {
    const bookingId = req.params.id;
    const booking = await BookingService.getBookingDetails(bookingId);

    if (booking.status !== Enums.BOOKING_STATUS.BOOKED) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Ticket is only available for confirmed bookings",
        error: { explanation: "This booking is not confirmed yet." },
        data: {},
      });
    }

    // Fetch Flight details
    const flightResponse = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}`,
    );
    const flight = flightResponse.data.data;

    // Fetch User details
    const userResponse = await axios.get(
      `${ServerConfig.AUTH_SERVICE}/api/v1/auth/user/${booking.userId}`,
    );
    const user = userResponse.data.data;

    const passengerName = `${user.firstName} ${user.lastName || ""}`.trim();

    const bookingPayload = {
      ...(booking.toJSON ? booking.toJSON() : booking),
      passengerName,
    };

    const pdfBuffer = await generateTicketPDF(bookingPayload, flight);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Ticket-${bookingId}.pdf`,
    );
    return res.status(StatusCodes.OK).send(pdfBuffer);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = error.explanation || "Failed to download ticket";
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function getAllBookings(req, res) {
  try {
    const bookings = await BookingService.getAllBookings();
    const response = SuccessResponse();
    response.data = bookings;
    response.message = "Successfully fetched all bookings";
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = "Failed to fetch bookings list";
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function confirmBooking(req, res) {
  try {
    const booking = await BookingService.confirmBooking(req.params.id);
    const response = SuccessResponse();
    response.data = booking;
    response.message = "Booking successfully confirmed";
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = "Failed to confirm booking";
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
  downloadTicket,
  getAllBookings,
  confirmBooking,
};
