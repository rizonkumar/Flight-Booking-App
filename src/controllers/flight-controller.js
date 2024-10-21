const { StatusCodes } = require("http-status-codes");
const { MESSAGES } = require("../utils/constants");

const { FlightService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function createFlight(req, res) {
  try {
    const flight = await FlightService.createFlight({
      flightNumber: req.body.name,
      airplaneId: req.body.code,
      departureAirportId: req.body.address,
      arrivalAirportId: req.body.cityId,
      arrivalTime: req.body.arrivalTime,
      departureTime: req.body.departureTime,
    });
    SuccessResponse.data = flight;
    SuccessResponse.message = MESSAGES.SUCCESS.FLIGHT_CREATED;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    console.log("Error", error);
    ErrorResponse.error = error.explanation || error.message;
    ErrorResponse.message = MESSAGES.ERROR.CANNOT_CREATE_FLIGHT;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

module.exports = {
  createFlight,
};
