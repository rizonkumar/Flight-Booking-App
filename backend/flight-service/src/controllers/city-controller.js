const { StatusCodes } = require("http-status-codes");
const { MESSAGES } = require("../utils/constants");

const { CityService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function createCity(req, res) {
  try {
    const city = await CityService.createCity({
      name: req.body.name,
    });
    const response = SuccessResponse();
    response.data = city;
    response.message = MESSAGES.SUCCESS.CITY_CREATED;
    return res.status(StatusCodes.CREATED).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.CANNOT_CREATE_CITY;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function getCities(req, res) {
  try {
    const cities = await CityService.getCities();
    const response = SuccessResponse();
    response.data = cities;
    response.message = MESSAGES.SUCCESS.CITIES_FETCHED;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UNABLE_TO_FETCH_ALL_CITIES;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function updateCity(req, res) {
  try {
    const city = await CityService.updateCity(req.params.id, {
      name: req.body.name,
    });
    const response = SuccessResponse();
    response.data = city;
    response.message = MESSAGES.SUCCESS.UPDATE_CITY_SUCCESS;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.UPDATE_CITY_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

async function deleteCity(req, res) {
  try {
    const city = await CityService.deleteCity(req.params.id);
    const response = SuccessResponse();
    response.data = city;
    response.message = MESSAGES.SUCCESS.DELETE_CITY_SUCCESS;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    const response = ErrorResponse();
    response.error = error.explanation || error.message;
    response.message = MESSAGES.ERROR.DELETE_CITY_FAILED;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(response);
  }
}

module.exports = { createCity, getCities, updateCity, deleteCity };
