const { StatusCodes } = require("http-status-codes");
const { ErrorResponse } = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const { MESSAGES, CONFIG } = require("../utils/constants");

function validateCreateRequest(req, res, next) {
  if (!req.body.flightNumber) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.FLIGHT_NUMBER_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.airplaneId) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.AIRPLANE_ID_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.departureAirportId) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.DEPARTURE_AIRPORT_CODE_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.arrivalAirportId) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.ARRIVAL_AIRPORT_CODE_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.arrivalTime) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.ARRIVATE_TIME_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.departureTime) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.DEPARTURE_TIME_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.price) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.PRICE_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.totalSeats) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.TOTAL_SEATS_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  next();
}

function validateUpdateSeatsRequest(req, res, next) {
  if (!req.body.seats) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.SEATS_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  next();
}
module.exports = {
  validateCreateRequest,
  validateUpdateSeatsRequest,
};
