const logger = require("../config/logger-config");
const { MESSAGES } = require("../utils/constants");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

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
      throw new AppError("Resource not found", StatusCodes.NOT_FOUND);
    }
    return response;
  }

  async get(data) {
    const response = await this.model.findByPk(data);
    if (!response) {
      throw new AppError("Resource not found", StatusCodes.NOT_FOUND);
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
    const [affectedRows] = await this.model.update(data, {
      where: {
        id: id,
      },
    });

    if (affectedRows == 0) {
      throw new AppError(MESSAGES.ERROR.NOT_FOUND, StatusCodes.NOT_FOUND);
    }

    const updatedEntity = await this.model.findByPk(id);
    return updatedEntity;
  }
}

module.exports = CrudRepository;
