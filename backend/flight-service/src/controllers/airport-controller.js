const { StatusCodes } = require("http-status-codes");
const { MESSAGES } = require("../utils/constants");

const { AirportService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function createAirport(req, res) {
  try {
    const airport = await AirportService.createAirport({
      name: req.body.name,
      code: req.body.code,
      address: req.body.address,
      cityId: req.body.cityId,
    });
    const response = SuccessResponse();
    response.data = airport;
    response.message = MESSAGES.SUCCESS.AIRPORT_CREATED;
    return res.status(StatusCodes.CREATED).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.AIRPORT_CREATE_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function getAirports(req, res) {
  try {
    const airports = await AirportService.getAirports();
    const response = SuccessResponse();
    response.data = airports;
    response.message = MESSAGES.SUCCESS.AIRPORT_FETCHED;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UNABLE_TO_FETCH_ALL_AIRPORTS;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function getAirport(req, res) {
  try {
    const airport = await AirportService.getAirport(req.params.id);
    const response = SuccessResponse();
    response.data = airport;
    response.message = MESSAGES.SUCCESS.AIRPORT_FETCHED;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UNABLE_TO_FETCH_AIRPORT;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function deleteAirport(req, res) {
  try {
    const airport = await AirportService.deleteAirport(req.params.id);
    const response = SuccessResponse();
    response.data = airport;
    response.message = MESSAGES.SUCCESS.DELETE_AIRPORT_SUCCESS;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.DELETE_AIRPORT_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

module.exports = {
  createAirport,
  getAirports,
  getAirport,
  deleteAirport,
};
