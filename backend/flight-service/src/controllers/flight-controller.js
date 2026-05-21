const { StatusCodes } = require("http-status-codes");
const { MESSAGES } = require("../utils/constants");

const { FlightService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function createFlight(req, res) {
  try {
    const flight = await FlightService.createFlight({
      flightNumber: req.body.flightNumber,
      airplaneId: req.body.airplaneId,
      departureAirportId: req.body.departureAirportId,
      arrivalAirportId: req.body.arrivalAirportId,
      arrivalTime: req.body.arrivalTime,
      departureTime: req.body.departureTime,
      price: req.body.price,
      boardingGate: req.body.boardingGate,
      totalSeats: req.body.totalSeats,
    });
    const response = SuccessResponse();
    response.data = flight;
    response.message = MESSAGES.SUCCESS.FLIGHT_CREATED;
    return res.status(StatusCodes.CREATED).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.CANNOT_CREATE_FLIGHT;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function getAllFlights(req, res) {
  try {
    const flights = await FlightService.getAllFlights(req.query);
    const response = SuccessResponse();
    response.data = flights;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UNABLE_TO_FETCH_ALL_FLIGHTS;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function getFlight(req, res) {
  try {
    const flight = await FlightService.getFlight(req.params.id);
    const response = SuccessResponse();
    response.data = flight;
    response.message = MESSAGES.SUCCESS.FLIGHT_FETCHED;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UNABLE_TO_FETCH_FLIGHT;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function updateSeats(req, res) {
  try {
    const response = await FlightService.updateSeats({
      flightId: req.params.id,
      seats: req.body.seats,
      dec: req.body.dec,
    });
    const successResponse = SuccessResponse();
    successResponse.data = response;
    return res.status(StatusCodes.OK).json(successResponse);
  } catch (error) {
    const errorResponse = ErrorResponse();
    errorResponse.error = error.explanation || error.message;
    errorResponse.message = MESSAGES.ERROR.FAILED_TO_UPDATE_SEATS;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

module.exports = {
  createFlight,
  getAllFlights,
  getFlight,
  updateSeats,
};
