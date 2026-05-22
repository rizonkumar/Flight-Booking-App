const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const { FlightRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const { MESSAGES } = require("../utils/constants");
const { compareTime } = require("../utils/helpers/date-time-helper");

const flightRepository = new FlightRepository();

async function createFlight(data) {
  try {
    if (!compareTime(data.departureTime, data.arrivalTime)) {
      throw new AppError(
        MESSAGES.ERROR.INVALID_FLIGHT_TIME,
        StatusCodes.BAD_REQUEST
      );
    }
    const response = await flightRepository.create(data);
    return response;
  } catch (error) {
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      let explanation = error.errors.map((err) => err.message);
      throw new AppError(explanation, StatusCodes.BAD_REQUEST);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      MESSAGES.ERROR.CANNOT_CREATE_FLIGHT,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function generateDynamicFlights(departureAirportId, arrivalAirportId, tripDate) {
  const { Airplane, Flight } = require("../models");
  try {
    const airplanes = await Airplane.findAll({ limit: 10 });
    if (airplanes.length === 0) {
      return;
    }

    const baseDate = new Date(tripDate);
    const flightsToCreate = [];

    for (let i = 0; i < 22; i++) {
      const airplane = airplanes[i % airplanes.length];
      
      const departureTime = new Date(baseDate);
      const startMinutes = 5 * 60 + i * 50;
      departureTime.setUTCHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

      const durationHours = 1 + (i % 6);
      const durationMinutes = (i * 15) % 60;
      const arrivalTime = new Date(departureTime.getTime() + (durationHours * 60 + durationMinutes) * 60 * 1000);

      const basePrice = 2800 + ((i * 733) % 12000) + (durationHours * 600);

      const flightNumSuffix = String(20000 + i * 137 + Math.floor(Math.random() * 1000)).substring(0, 5);
      const flightNumber = `FB${flightNumSuffix}`;

      flightsToCreate.push({
        flightNumber,
        airplaneId: airplane.id,
        departureAirportId,
        arrivalAirportId,
        departureTime,
        arrivalTime,
        price: basePrice,
        boardingGate: `${String.fromCharCode(65 + (i % 12))}${(i % 40) + 1}`,
        totalSeats: airplane.capacity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await Flight.bulkCreate(flightsToCreate, { ignoreDuplicates: true });
  } catch (error) {
    console.error("Error generating dynamic flights:", error);
  }
}

async function getAllFlights(query) {
  // trips = MUM -CHN
  let customFilters = {};
  let sortFilter = [];
  const endingTime = " 23:59:00";
  // TODO: Move the query fitlers to different function
  if (query.trips) {
    [departureAirportId, arrivalAirportId] = query.trips.split("-");
    customFilters.arrivalAirportId = arrivalAirportId;
    customFilters.departureAirportId = departureAirportId;
    // TODO: departureAirportTime should be greater than arrivalAirportTime we already have function for that in helper
  }
  if (query.price) {
    [minPrice, maxPrice] = query.price.split("-");
    customFilters.price = {
      [Op.between]: [minPrice, maxPrice === undefined ? 20000 : maxPrice],
    };
  }
  if (query.travellers) {
    customFilters.totalSeats = { [Op.gte]: query.travellers };
  }
  // TODO: Fix this filter, not working proplery
  if (query.tripDate) {
    customFilters.departureTime = {
      [Op.between]: [query.tripDate, query.tripDate + endingTime],
    };
  }
  if (query.sort) {
    const params = query.sort.split(",");
    const sortFilters = params.map((param) => param.split("_"));
    sortFilter = sortFilters;
  }
  try {
    if (query.trips && query.tripDate) {
      const [dep, arr] = query.trips.split("-");
      const { Flight } = require("../models");
      const existingCount = await Flight.count({
        where: {
          departureAirportId: dep,
          arrivalAirportId: arr,
          departureTime: {
            [Op.between]: [query.tripDate, query.tripDate + endingTime],
          },
        },
      });

      if (existingCount < 20) {
        await generateDynamicFlights(dep, arr, query.tripDate);
      }
    }

    const flights = await flightRepository.getAllFlights(
      customFilters,
      sortFilter
    );
    return flights;
  } catch (error) {
    throw new AppError(
      MESSAGES.ERROR.UNABLE_TO_FETCH_ALL_FLIGHTS,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getFlight(id) {
  try {
    const flight = await flightRepository.get(id);
    return flight;
  } catch (error) {
    if (error.statusCode === StatusCodes.NOT_FOUND) {
      throw new AppError(
        MESSAGES.ERROR.FLIGHT_NOT_FOUND,
        StatusCodes.NOT_FOUND
      );
    }
    throw new AppError(
      MESSAGES.ERROR.UNABLE_TO_FETCH_FLIGHT,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateSeats(data) {
  try {
    const response = await flightRepository.updateRemainingSeats(
      data.flightId,
      data.seats,
      data.dec
    );
    return response;
  } catch (error) {
    throw new AppError(
      MESSAGES.ERROR.FAILED_TO_UPDATE_SEATS,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = { createFlight, getAllFlights, getFlight, updateSeats };
