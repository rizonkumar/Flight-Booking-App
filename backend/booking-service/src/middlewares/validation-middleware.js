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

const bookingSchema = z.object({
  flightId: z.number({ required_error: 'Flight ID is required' }).int().positive(),
  userId: z.number({ required_error: 'User ID is required' }).int().positive(),
  noofSeats: z.number({ required_error: 'Number of seats is required' }).int().positive().max(10, 'Cannot book more than 10 seats at once'),
});

const paymentSchema = z.object({
  totalCost: z.number({ required_error: 'Total cost is required' }).positive(),
  userId: z.number({ required_error: 'User ID is required' }).int().positive(),
  bookingId: z.number({ required_error: 'Booking ID is required' }).int().positive(),
});

module.exports = {
  validateRequest,
  validateBooking: validateRequest(bookingSchema),
  validatePayment: validateRequest(paymentSchema),
};
