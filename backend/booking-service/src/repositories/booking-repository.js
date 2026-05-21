const { StatusCodes } = require("http-status-codes");

const CrudRepository = require("./crud-repository");
const db = require("../models/");
const AppError = require("../utils/errors/app-error");

class BookingRespository extends CrudRepository {
  constructor() {
    super(db.Booking);
  }

  async createBooking(data, transaction) {
    const response = await db.Booking.create(data, { transaction: transaction });
    return response;
  }

  async get(data) {
    const response = await this.model.findByPk(data);
    if (!response) {
      throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
    }
    return response;
  }

  async update(id, data, transaction) {
    const response = await this.model.update(
      data,
      {
        where: { id: id },
        transaction: transaction,
      }
    );
    return response;
  }
}

module.exports = BookingRespository;
