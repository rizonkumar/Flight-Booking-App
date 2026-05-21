const { StatusCodes } = require('http-status-codes');
const { Logger } = require('../config');
const AppError = require('../utils/errors/app-error');
const { MESSAGES } = require('../utils/constants');

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const result = await this.model.create(data);
            return result;
        } catch (error) {
            Logger.error(`CrudRepository create error: ${error.message}`);
            throw error;
        }
    }

    async destroy(id) {
        try {
            const result = await this.model.findByPk(id);
            if (!result) {
                throw new AppError(
                    MESSAGES.ERROR.RESOURCE_NOT_FOUND,
                    StatusCodes.NOT_FOUND,
                    'Resource not found'
                );
            }
            await result.destroy();
            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            Logger.error(`CrudRepository destroy error: ${error.message}`);
            throw error;
        }
    }

    async get(id) {
        try {
            const result = await this.model.findByPk(id);
            if (!result) {
                throw new AppError(
                    MESSAGES.ERROR.RESOURCE_NOT_FOUND,
                    StatusCodes.NOT_FOUND,
                    'Resource not found'
                );
            }
            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            Logger.error(`CrudRepository get error: ${error.message}`);
            throw error;
        }
    }

    async getAll() {
        try {
            const results = await this.model.findAll();
            return results;
        } catch (error) {
            Logger.error(`CrudRepository getAll error: ${error.message}`);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const result = await this.model.findByPk(id);
            if (!result) {
                throw new AppError(
                    MESSAGES.ERROR.RESOURCE_NOT_FOUND,
                    StatusCodes.NOT_FOUND,
                    'Resource not found'
                );
            }
            const updatedResult = await result.update(data);
            return updatedResult;
        } catch (error) {
            if (error instanceof AppError) throw error;
            Logger.error(`CrudRepository update error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = CrudRepository;
