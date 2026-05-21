const { StatusCodes } = require("http-status-codes");
const { ErrorResponse } = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const { MESSAGES, CONFIG } = require("../utils/constants");

function validateCreateRequest(req, res, next) {
  if (!req.body.name) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.NAME_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.code) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.CITYID_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  if (!req.body.cityId) {
    const response = ErrorResponse();
    response.message = MESSAGES.ERROR.INVALID_INPUT;
    response.error = new AppError(
      [MESSAGES.ERROR.AIRPORT_CODE_REQUIRED],
      StatusCodes.BAD_REQUEST
    );
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  next();
}
module.exports = {
  validateCreateRequest,
};
