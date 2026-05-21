const { StatusCodes } = require("http-status-codes");
const { MESSAGES } = require("../utils/constants");

const { AirplaneService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function createAirplane(req, res) {
  try {
    const airplane = await AirplaneService.createAirplane({
      modelNumber: req.body.modelNumber,
      capacity: req.body.capacity,
    });
    const response = SuccessResponse();
    response.data = airplane;
    response.message = MESSAGES.SUCCESS.AIRPLANE_CREATED;
    return res.status(StatusCodes.CREATED).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.AIRPLANE_CREATE_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function getAirplanes(req, res) {
  try {
    const airplanes = await AirplaneService.getAirplanes();
    const response = SuccessResponse();
    response.data = airplanes;
    response.message = MESSAGES.SUCCESS.AIRPLANE_FETCHED;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UNABLE_TO_FETCH_ALL_AIRPLANES;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function getAirplane(req, res) {
  try {
    const airplanes = await AirplaneService.getAirplane(req.params.id);
    const response = SuccessResponse();
    response.data = airplanes;
    response.message = MESSAGES.SUCCESS.AIRPLANE_FETCHED;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UNABLE_TO_FETCH_AIRPLANE;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function deleteAirplane(req, res) {
  try {
    const airplane = await AirplaneService.deleteAirplane(req.params.id);
    const response = SuccessResponse();
    response.data = airplane;
    response.message = MESSAGES.SUCCESS.DELETE_AIRPLANE_SUCCESS;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.DELETE_AIRPLANE_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function updateAirplane(req, res) {
  try {
    const airplane = await AirplaneService.updateAirplane(
      { capacity: req.body.capacity },
      req.params.id
    );
    const response = SuccessResponse();
    response.data = airplane;
    response.message = MESSAGES.SUCCESS.UPDATE_AIRPLANE_SUCCESS;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UPDATE_AIRPLANE_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}
module.exports = {
  createAirplane,
  getAirplanes,
  getAirplane,
  deleteAirplane,
  updateAirplane,
};
