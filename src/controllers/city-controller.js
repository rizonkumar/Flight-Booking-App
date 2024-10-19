const { StatusCodes } = require("http-status-codes");
const { MESSAGES } = require("../utils/constants");

const { CityService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function createCity(req, res) {
  try {
    const city = await CityService.createCity({
      name: req.body.name,
    });
    SuccessResponse.data = city;
    SuccessResponse.message = MESSAGES.SUCCESS.CITY_CREATED;
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error.explanation || error.message;
    ErrorResponse.message = MESSAGES.ERROR.CANNOT_CREATE_CITY;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
}

module.exports = { createCity };