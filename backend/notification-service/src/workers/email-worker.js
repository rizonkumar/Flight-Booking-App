const Queue = require('bull');
const nodemailer = require('nodemailer');
const { ServerConfig, Logger, getTransporter } = require('../config');
const { generateTicketPDF } = require('../utils/helpers/ticket-generator');

// Initialize Bull Queue
const emailQueue = new Queue('email-queue', {
  redis: {
    host: ServerConfig.REDIS_HOST,
    port: ServerConfig.REDIS_PORT
  }
});

Logger.info(`Email Worker connected to Redis at ${ServerConfig.REDIS_HOST}:${ServerConfig.REDIS_PORT}`);

// Queue Processor
emailQueue.process(async (job) => {
  const { type, data } = job.data;
  Logger.info(`Processing job ID ${job.id} for notification type: ${type}`);

  if (!data) {
    throw new Error(`Job payload is missing data object for job ID ${job.id}`);
  }

  const recipientEmail = data.passengerEmail || data.email || data.recipientEmail;
  if (!recipientEmail) {
    throw new Error(`Recipient email address not found in job data for job ID ${job.id}`);
  }

  // Retrieve SMTP Transporter
  const transporter = await getTransporter();
  const senderEmail = ServerConfig.GMAIL_SMTP_EMAIL || '"SkyRoute Support" <support@skyroute.com>';

  try {
    if (type === 'BOOKING_CONFIRMATION') {
      Logger.info(`Generating ticket PDF for booking ID: ${data.bookingId}`);
      const pdfBuffer = await generateTicketPDF(data);

      const mailOptions = {
        from: senderEmail,
        to: recipientEmail,
        subject: `Booking Confirmed - Ticket: ${data.bookingId || 'N/A'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #1a365d; padding: 15px; border-radius: 6px 6px 0 0; text-align: center; color: white;">
              <h2 style="margin: 0;">SkyRoute Airlines</h2>
            </div>
            <div style="padding: 20px;">
              <h3 style="color: #2b6cb0;">Your Booking is Confirmed!</h3>
              <p>Dear <strong>${data.passengerName || 'Valued Customer'}</strong>,</p>
              <p>Thank you for choosing SkyRoute Airlines. Your flight booking has been successfully confirmed. We have attached your beautiful boarding pass ticket to this email.</p>
              
              <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                <tr style="background-color: #f7fafc;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Flight</th>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${data.flightNumber || 'SR-340'}</td>
                </tr>
                <tr>
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Departure</th>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.departureCity || 'N/A'} (${data.departureAirport || 'N/A'}) at ${data.departureTime || 'N/A'}</td>
                </tr>
                <tr style="background-color: #f7fafc;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Arrival</th>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${data.arrivalCity || 'N/A'} (${data.arrivalAirport || 'N/A'}) at ${data.arrivalTime || 'N/A'}</td>
                </tr>
                <tr>
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Seat</th>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #dd6b20;">${data.seatNumber || 'N/A'}</td>
                </tr>
                <tr style="background-color: #f7fafc;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Booking ID</th>
                  <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${data.bookingId || 'N/A'}</td>
                </tr>
              </table>
              
              <p style="margin-top: 20px;">Please read the instructions on the boarding ticket carefully before heading to the airport.</p>
              <p>We look forward to welcoming you on board. Have a safe and pleasant journey!</p>
            </div>
            <div style="background-color: #f7fafc; padding: 10px; border-radius: 0 0 6px 6px; text-align: center; font-size: 12px; color: #718096;">
              &copy; 2026 SkyRoute Airlines. All rights reserved.
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `Ticket-${data.bookingId || 'booking'}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await transporter.sendMail(mailOptions);
      Logger.info(`Booking Confirmation email sent successfully to ${recipientEmail} for booking ID: ${data.bookingId}`);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        Logger.info(`[Ethereal Sandbox] View Booking Confirmation Mail: ${previewUrl}`);
      }

    } else if (type === 'BOOKING_CANCELLATION') {
      Logger.info(`Processing Booking Cancellation notification for booking ID: ${data.bookingId}`);

      const refundValue = typeof data.refundAmount === 'number'
        ? `$${data.refundAmount.toFixed(2)}`
        : (data.refundAmount || data.totalPrice || 'Full Refund');

      const mailOptions = {
        from: senderEmail,
        to: recipientEmail,
        subject: `Booking Cancelled & Refund Initiated: ${data.bookingId || 'N/A'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #c53030; padding: 15px; border-radius: 6px 6px 0 0; text-align: center; color: white;">
              <h2 style="margin: 0;">SkyRoute Airlines</h2>
            </div>
            <div style="padding: 20px;">
              <h3 style="color: #c53030;">Booking Cancellation Confirmed</h3>
              <p>Dear <strong>${data.passengerName || 'Valued Customer'}</strong>,</p>
              <p>We are writing to confirm that your flight booking <strong>${data.bookingId || 'N/A'}</strong> has been successfully cancelled.</p>
              
              <div style="background-color: #fffaf0; border: 1px solid #feebc8; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #dd6b20;">Refund Information</h4>
                <p style="margin: 0 0 5px 0;"><strong>Refund Amount:</strong> ${refundValue}</p>
                <p style="margin: 0; font-size: 13px; color: #718096;">The amount will be credited back to your original source of payment within 5-7 business days.</p>
              </div>
              
              <p>We deeply regret any inconvenience caused. If you did not make this request or have any other concerns, please contact our support desk immediately.</p>
              <p>We hope to serve you better next time.</p>
            </div>
            <div style="background-color: #f7fafc; padding: 10px; border-radius: 0 0 6px 6px; text-align: center; font-size: 12px; color: #718096;">
              &copy; 2026 SkyRoute Airlines. All rights reserved.
            </div>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      Logger.info(`Booking Cancellation email sent successfully to ${recipientEmail} for booking ID: ${data.bookingId}`);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        Logger.info(`[Ethereal Sandbox] View Booking Cancellation Mail: ${previewUrl}`);
      }

    } else {
      Logger.warn(`Unknown job type '${type}' received in email-queue. Skipping.`);
    }

  } catch (error) {
    Logger.error(`Error processing job ${job.id} for type ${type}:`, error);
    throw error; // Re-throw to fail the job and let Bull handle retry policy if configured
  }
});

// Event Listeners for Queue
emailQueue.on('failed', (job, err) => {
  Logger.error(`Job ID ${job.id} failed with error: ${err.message}`);
});

emailQueue.on('completed', (job) => {
  Logger.info(`Job ID ${job.id} has been processed successfully.`);
});

module.exports = emailQueue;
