const { Sequelize } = require("sequelize");

const CrudRepository = require("./crud-repository");
const { Flight, Airplane, Airport, City } = require("../models");
const db = require("../models");
const { addRowLockOnFlights } = require("./queries");
class FlightRepository extends CrudRepository {
  constructor() {
    super(Flight);
  }

  async getAllFlights(filter, sort) {
    const response = await Flight.findAll({
      where: filter,
      order: sort,
      include: [
        {
          model: Airplane,
          required: true,
          as: "airplaneDetail",
        },
        {
          model: Airport,
          required: true,
          as: "departureAirport",
          on: {
            col1: Sequelize.where(
              Sequelize.col("Flight.departureAirportId"),
              "=",
              Sequelize.col("departureAirport.code")
            ),
          },
          include: {
            model: City,
            required: true,
          },
        },
        {
          model: Airport,
          required: true,
          as: "arrivalAirport",
          on: {
            col1: Sequelize.where(
              Sequelize.col("Flight.arrivalAirportId"),
              "=",
              Sequelize.col("arrivalAirport.code")
            ),
          },
          include: {
            model: City,
            required: true,
          },
        },
      ],
    });
    return response;
  }

  async updateRemainingSeats(flightId, seats, dec = true) {
    const transaction = await db.sequelize.transaction();
    try {
      // Lock the row to prevent concurrent updates
      await db.sequelize.query(addRowLockOnFlights(flightId));

      const flight = await Flight.findByPk(flightId);
      if (!flight) {
        throw new Error("Flight not found");
      }

      if (dec) {
        // Check if enough seats are available before decrementing
        if (flight.totalSeats < seats) {
          throw new Error("Not enough seats available");
        }
        await flight.decrement(
          "totalSeats",
          { by: seats },
          { transaction: transaction }
        );
      } else {
        await flight.increment(
          "totalSeats",
          { by: seats },
          { transaction: transaction }
        );
      }

      await transaction.commit();

      // Fetch updated flight data
      const updatedFlight = await Flight.findByPk(flightId);
      return updatedFlight;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Failed to update seats: ${error.message}`);
    }
  }
}

module.exports = FlightRepository;
