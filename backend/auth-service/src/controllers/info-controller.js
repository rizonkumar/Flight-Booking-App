const { StatusCodes } = require('http-status-codes');
const { SuccessResponse } = require('../utils/common');
const { MESSAGES } = require('../utils/constants');

function info(req, res) {
    const response = SuccessResponse();
    response.message = MESSAGES.SUCCESS.HEALTH_CHECK;
    return res.status(StatusCodes.OK).json(response);
}

module.exports = {
    info,
};
