const logger = require("../config/logger-config");
const { MESSAGES } = require("../utils/constants");
const { StatusCodes } = require("http-status-codes");

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const response = await this.model.create(data);
    return response;
  }

  async destroy(data) {
    const response = await this.model.destroy({
      where: {
        id: data,
      },
    });
    if (!response) {
      throw new Error(MESSAGES.ERROR.AIRPLANE_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    return response;
  }

  async get(data) {
    const response = await this.model.findByPk(data);
    if (!response) {
      throw new Error(MESSAGES.ERROR.AIRPLANE_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    return response;
  }

  async getAll(data) {
    try {
      const response = await this.model.findAll();
      return response;
    } catch (error) {
      logger.error(`Error in getAll method: ${error.message}`);
      logger.error(MESSAGES.ERROR.DATABASE_ERROR);
      throw error;
    }
  }

  async update(id, data) {
    // data -> {col: value, ....}
    const response = await this.model.update(data, {
      where: {
        id: id,
      },
    });
    return response;
  }
}

module.exports = CrudRepository;
