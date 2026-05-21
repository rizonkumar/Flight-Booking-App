const cron = require("node-cron");
const axios = require("axios");
const { Op } = require("sequelize");
const db = require("../../models");
const { ServerConfig, Logger } = require("../../config");
const { Enums } = require("../common");
const { INITIATED, CANCELLED } = Enums.BOOKING_STATUS;

function setupBookingExpiryCron() {
  cron.schedule("*/5 * * * *", async () => {
    Logger.info("Starting background cron: Checking for expired initiated bookings...");

    const transaction = await db.sequelize.transaction();
    try {
      const expiryTime = new Date(Date.now() - 15 * 60 * 1000);
      const expiredBookings = await db.Booking.findAll({
        where: {
          status: INITIATED,
          createdAt: {
            [Op.lt]: expiryTime,
          },
        },
        transaction,
      });

      if (expiredBookings.length === 0) {
        Logger.info("No expired initiated bookings found.");
        await transaction.commit();
        return;
      }

      Logger.info(`Found ${expiredBookings.length} expired booking(s). Starting cancellation process...`);

      for (const booking of expiredBookings) {
        Logger.info(`Expiring Booking #${booking.id} (Flight #${booking.flightId}, Seats: ${booking.noOfSeats})`);

        try {
          await axios.patch(
            `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}/seats`,
            {
              seats: booking.noOfSeats,
              dec: false,
            }
          );
          Logger.info(`Successfully restored ${booking.noOfSeats} seat(s) for Flight #${booking.flightId}`);
        } catch (axiosError) {
          Logger.error(
            `Failed to restore seats for Booking #${booking.id} on Flight #${booking.flightId}: ${axiosError.message}`
          );
        }

        booking.status = CANCELLED;
        await booking.save({ transaction });
      }

      await transaction.commit();
      Logger.info("Background cron successfully expired and processed all stale bookings.");
    } catch (error) {
      await transaction.rollback();
      Logger.error(`Error encountered during booking expiry cron execution: ${error.message}`);
    }
  });
}

module.exports = { setupBookingExpiryCron };
