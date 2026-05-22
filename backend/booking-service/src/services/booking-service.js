const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const { BookingRepository } = require("../repositories");
const { ServerConfig } = require("../config");
const db = require("../models");
const AppError = require("../utils/errors/app-error");
const { MESSAGES, CONFIG } = require("../utils/constants");
const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;
const { Logger, Queue } = require("../config");

const bookingRespository = new BookingRepository();

async function createBooking(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`
    );
    const flightData = flight.data.data;

    if (data.noofSeats > flightData.totalSeats) {
      throw new AppError(
        MESSAGES.ERROR.NO_OF_SEATS_EXCEEDS_AVAILABLE_SEATS.replace(
          "{{requested}}",
          flightData.totalSeats
        ).replace("{{available}}", flightData),
        StatusCodes.BAD_REQUEST
      );
    }

    const totalBookingAmount = data.noofSeats * flightData.price;
    const bookingPayload = {
      flightId: data.flightId,
      userId: data.userId,
      noOfSeats: data.noofSeats,
      totalCost: totalBookingAmount,
    };

    const booking = await bookingRespository.createBooking(
      bookingPayload,
      transaction
    );

    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      {
        seats: data.noofSeats,
      }
    );

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      MESSAGES.ERROR.BOOKING_FAILED,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    const bookingDetails = await bookingRespository.get(data.bookingId);
    
    if (bookingDetails.status === BOOKED) {
      throw new AppError("Booking is already completed", StatusCodes.BAD_REQUEST);
    }
    if (bookingDetails.status === CANCELLED) {
      throw new AppError("Booking is already cancelled", StatusCodes.BAD_REQUEST);
    }

    if (bookingDetails.totalCost !== parseInt(data.totalCost)) {
      throw new AppError(
        MESSAGES.ERROR.PAYMENT_FAILED,
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingDetails.userId !== parseInt(data.userId)) {
      throw new AppError(
        MESSAGES.ERROR.PAYMENT_FAILED_1,
        StatusCodes.BAD_REQUEST
      );
    }

    // we assume here that payment gateway is working fine
    await bookingRespository.update(data.bookingId, {
      status: BOOKED,
    }, transaction);

    await transaction.commit();

    // Async call to fetch details and enqueue booking confirmation email
    try {
      const userResponse = await axios.get(
        `${ServerConfig.AUTH_SERVICE}/api/v1/auth/user/${bookingDetails.userId}`
      );
      const user = userResponse.data.data;
      
      const flightResponse = await axios.get(
        `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}`
      );
      const flight = flightResponse.data.data;

      let departureCityName = flight.departureAirportId;
      let arrivalCityName = flight.arrivalAirportId;
      try {
        const depAirportResponse = await axios.get(
          `${ServerConfig.FLIGHT_SERVICE}/api/v1/airports/${flight.departureAirportId}`
        );
        departureCityName = depAirportResponse.data.data.name;
      } catch (err) {}
      
      try {
        const arrAirportResponse = await axios.get(
          `${ServerConfig.FLIGHT_SERVICE}/api/v1/airports/${flight.arrivalAirportId}`
        );
        arrivalCityName = arrAirportResponse.data.data.name;
      } catch (err) {}

      const emailPayload = {
        type: 'BOOKING_CONFIRMATION',
        data: {
          passengerEmail: user.email,
          passengerName: `${user.firstName} ${user.lastName || ''}`.trim(),
          flightNumber: flight.flightNumber,
          departureCity: departureCityName,
          departureAirport: flight.departureAirportId,
          departureTime: new Date(flight.departureTime).toLocaleString(),
          arrivalCity: arrivalCityName,
          arrivalAirport: flight.arrivalAirportId,
          arrivalTime: new Date(flight.arrivalTime).toLocaleString(),
          seatNumber: `${Math.floor(Math.random() * 30) + 1}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}`,
          flightClass: 'Economy',
          bookingId: bookingDetails.id,
          totalPrice: bookingDetails.totalCost,
        }
      };

      await Queue.add(emailPayload);
      Logger.info(`Enqueued confirmation notification for booking ID: ${bookingDetails.id}`);
    } catch (apiError) {
      Logger.error(`Could not fetch details or enqueue confirmation notification: ${apiError.message}`);
    }

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function cancelBooking(bookingId, forceFullRefund = false) {
  const transaction = await db.sequelize.transaction();
  try {
    const booking = await bookingRespository.get(bookingId);
    if (!booking) {
      throw new AppError(MESSAGES.ERROR.BOOKING_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    if (booking.status === CANCELLED) {
      throw new AppError("Booking is already cancelled", StatusCodes.BAD_REQUEST);
    }
    
    const flightResponse = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}`
    );
    const flight = flightResponse.data.data;
    
    // Calculate refund amount based on departure time
    const departureTime = new Date(flight.departureTime);
    const currentTime = new Date();
    const diffInHours = (departureTime - currentTime) / (1000 * 60 * 60);
    
    let refundPercent = 0;
    if (forceFullRefund) {
      refundPercent = 1.0;
    } else if (diffInHours > 48) {
      refundPercent = 1.0;
    } else if (diffInHours >= 24 && diffInHours <= 48) {
      refundPercent = 0.5;
    } else {
      refundPercent = 0.0;
    }
    
    const refundAmount = booking.totalCost * refundPercent;
    
    booking.status = CANCELLED;
    await booking.save({ transaction });
    
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}/seats`,
      {
        seats: booking.noOfSeats,
        dec: false,
      }
    );
    
    await transaction.commit();
    
    // Fetch user details to send cancellation email
    try {
      const userResponse = await axios.get(
        `${ServerConfig.AUTH_SERVICE}/api/v1/auth/user/${booking.userId}`
      );
      const user = userResponse.data.data;
      
      const emailPayload = {
        type: 'BOOKING_CANCELLATION',
        data: {
          passengerEmail: user.email,
          passengerName: `${user.firstName} ${user.lastName || ''}`.trim(),
          bookingId: booking.id,
          refundAmount: refundAmount,
          flightNumber: flight.flightNumber,
        }
      };
      
      await Queue.add(emailPayload);
      Logger.info(`Enqueued cancellation notification for booking ID: ${booking.id}`);
    } catch (userError) {
      Logger.error(`Could not send cancellation email for booking ID: ${booking.id}: ${userError.message}`);
    }
    
    return {
      bookingId: booking.id,
      status: CANCELLED,
      totalCost: booking.totalCost,
      refundPercent: `${refundPercent * 100}%`,
      refundAmount: refundAmount,
    };
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.message || "Failed to cancel booking",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getBookingDetails(bookingId) {
  try {
    const booking = await bookingRespository.get(bookingId);
    if (!booking) {
      throw new AppError(MESSAGES.ERROR.BOOKING_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    const bookingData = booking.toJSON ? booking.toJSON() : booking;
    
    let flight = null;
    try {
      const flightResponse = await axios.get(
        `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}`
      );
      flight = flightResponse.data.data;
    } catch (err) {
      Logger.error(`Failed to fetch flight details for booking ${booking.id}: ${err.message}`);
    }
    
    let user = null;
    try {
      const userResponse = await axios.get(
        `${ServerConfig.AUTH_SERVICE}/api/v1/auth/user/${booking.userId}`
      );
      user = userResponse.data.data;
    } catch (err) {
      Logger.error(`Failed to fetch user details for booking ${booking.id}: ${err.message}`);
    }
    
    return {
      ...bookingData,
      flight,
      user,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.message || "Failed to fetch booking details",
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getAllBookings() {
  try {
    const bookings = await bookingRespository.getAll();
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingData = booking.toJSON ? booking.toJSON() : booking;
        
        let flight = null;
        try {
          const flightResponse = await axios.get(
            `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}`
          );
          flight = flightResponse.data.data;
        } catch (err) {
          Logger.error(`Failed to fetch flight details for booking ${booking.id}: ${err.message}`);
        }
        
        let user = null;
        try {
          const userResponse = await axios.get(
            `${ServerConfig.AUTH_SERVICE}/api/v1/auth/user/${booking.userId}`
          );
          user = userResponse.data.data;
        } catch (err) {
          Logger.error(`Failed to fetch user details for booking ${booking.id}: ${err.message}`);
        }
        
        return {
          ...bookingData,
          flight,
          user,
        };
      })
    );
    return enrichedBookings;
  } catch (error) {
    throw new AppError(
      error.message || "Failed to fetch bookings list",
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function confirmBooking(bookingId) {
  const transaction = await db.sequelize.transaction();
  try {
    const booking = await bookingRespository.get(bookingId);
    if (!booking) {
      throw new AppError(MESSAGES.ERROR.BOOKING_NOT_FOUND, StatusCodes.NOT_FOUND);
    }
    if (booking.status === BOOKED) {
      throw new AppError("Booking is already confirmed", StatusCodes.BAD_REQUEST);
    }
    if (booking.status === CANCELLED) {
      throw new AppError("Booking is already cancelled", StatusCodes.BAD_REQUEST);
    }
    
    booking.status = BOOKED;
    await booking.save({ transaction });
    await transaction.commit();
    
    // Async call to fetch details and enqueue booking confirmation email
    try {
      const userResponse = await axios.get(
        `${ServerConfig.AUTH_SERVICE}/api/v1/auth/user/${booking.userId}`
      );
      const user = userResponse.data.data;
      
      const flightResponse = await axios.get(
        `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}`
      );
      const flight = flightResponse.data.data;
      
      let departureCityName = flight.departureAirportId;
      let arrivalCityName = flight.arrivalAirportId;
      try {
        const depAirportResponse = await axios.get(
          `${ServerConfig.FLIGHT_SERVICE}/api/v1/airports/${flight.departureAirportId}`
        );
        departureCityName = depAirportResponse.data.data.name;
      } catch (err) {}
      
      try {
        const arrAirportResponse = await axios.get(
          `${ServerConfig.FLIGHT_SERVICE}/api/v1/airports/${flight.arrivalAirportId}`
        );
        arrivalCityName = arrAirportResponse.data.data.name;
      } catch (err) {}
      
      const emailPayload = {
        type: 'BOOKING_CONFIRMATION',
        data: {
          passengerEmail: user.email,
          passengerName: `${user.firstName} ${user.lastName || ''}`.trim(),
          flightNumber: flight.flightNumber,
          departureCity: departureCityName,
          departureAirport: flight.departureAirportId,
          departureTime: new Date(flight.departureTime).toLocaleString(),
          arrivalCity: arrivalCityName,
          arrivalAirport: flight.arrivalAirportId,
          arrivalTime: new Date(flight.arrivalTime).toLocaleString(),
          seatNumber: `${Math.floor(Math.random() * 30) + 1}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}`,
          flightClass: 'Economy',
          bookingId: booking.id,
          totalPrice: booking.totalCost,
        }
      };
      
      await Queue.add(emailPayload);
      Logger.info(`Enqueued confirmation notification for booking ID: ${booking.id}`);
    } catch (apiError) {
      Logger.error(`Could not fetch details or enqueue confirmation notification: ${apiError.message}`);
    }
    
    return booking;
  } catch (error) {
    await transaction.rollback();
    if (error instanceof AppError) throw error;
    throw new AppError(
      error.message || "Failed to confirm booking",
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = { createBooking, makePayment, cancelBooking, getBookingDetails, getAllBookings, confirmBooking };
