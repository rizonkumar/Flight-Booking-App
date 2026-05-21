const { z } = require('zod');
const { StatusCodes } = require('http-status-codes');

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        error: error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        data: {},
      });
    }
  };
}

const airplaneSchema = z.object({
  modelNumber: z.string({ required_error: 'Model number is required' }).min(1, 'Model number cannot be empty'),
  capacity: z.number({ required_error: 'Capacity is required' }).int().positive().max(1000, 'Capacity cannot exceed 1000').optional(),
});

const airplaneUpdateSchema = z.object({
  capacity: z.number({ required_error: 'Capacity is required' }).int().positive().max(1000, 'Capacity cannot exceed 1000').optional(),
});

const airportSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
  code: z.string({ required_error: 'Airport code is required' }).length(3, 'Airport code must be exactly 3 characters').toUpperCase(),
  address: z.string().optional(),
  cityId: z.number({ required_error: 'City ID is required' }).int().positive(),
});

const citySchema = z.object({
  name: z.string({ required_error: 'City name is required' }).min(1, 'City name cannot be empty'),
});

const flightSchema = z.object({
  flightNumber: z.string({ required_error: 'Flight number is required' }).min(1, 'Flight number cannot be empty'),
  airplaneId: z.number({ required_error: 'Airplane ID is required' }).int().positive(),
  departureAirportId: z.string({ required_error: 'Departure airport ID is required' }).min(1, 'Departure airport ID cannot be empty'),
  arrivalAirportId: z.string({ required_error: 'Arrival airport ID is required' }).min(1, 'Arrival airport ID cannot be empty'),
  arrivalTime: z.string({ required_error: 'Arrival time is required' }),
  departureTime: z.string({ required_error: 'Departure time is required' }),
  price: z.number({ required_error: 'Price is required' }).positive(),
  totalSeats: z.number({ required_error: 'Total seats is required' }).int().positive(),
});

const updateSeatsSchema = z.object({
  seats: z.number({ required_error: 'Seats count is required' }).int().positive(),
  dec: z.boolean().optional(),
});

module.exports = {
  validateRequest,
  validateCreateAirplane: validateRequest(airplaneSchema),
  validateUpdateAirplane: validateRequest(airplaneUpdateSchema),
  validateCreateAirport: validateRequest(airportSchema),
  validateCreateCity: validateRequest(citySchema),
  validateUpdateCity: validateRequest(citySchema),
  validateCreateFlight: validateRequest(flightSchema),
  validateUpdateSeats: validateRequest(updateSeatsSchema),
};
