const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');


function generateTicketPDF(bookingDetails = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const qrData = {
        bookingId: bookingDetails.bookingId || 'N/A',
        flightNumber: bookingDetails.flightNumber || 'N/A',
        passengerName: bookingDetails.passengerName || 'N/A',
        seatNumber: bookingDetails.seatNumber || 'N/A',
        status: 'CONFIRMED'
      };

      let qrBuffer;
      try {
        qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
          margin: 1,
          width: 150
        });
      } catch (err) {
        qrBuffer = null;
      }

      doc.rect(0, 0, 595, 120).fill('#1A365D');

      doc.fillColor('#FFFFFF')
         .fontSize(26)
         .font('Helvetica-Bold')
         .text('SkyRoute Airlines', 50, 40);

      doc.fontSize(10)
         .font('Helvetica')
         .text('Fly the Smart Way', 50, 72);

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('BOARDING PASS / TICKET', 320, 48, { align: 'right', width: 225 });

      doc.strokeColor('#CBD5E0')
         .lineWidth(1)
         .moveTo(50, 140)
         .lineTo(545, 140)
         .stroke();

      doc.fillColor('#1A365D')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('FLIGHT INFORMATION', 50, 155);

      doc.fillColor('#718096')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('FLIGHT NUMBER', 50, 180)
         .text('DEPARTURE', 185, 180)
         .text('ARRIVAL', 370, 180);

      doc.fillColor('#2D3748')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(bookingDetails.flightNumber || 'SR-340', 50, 195)
         .font('Helvetica')
         .text(`${bookingDetails.departureCity || 'New York'} (${bookingDetails.departureAirport || 'JFK'})`, 185, 195)
         .text(`${bookingDetails.arrivalCity || 'London'} (${bookingDetails.arrivalAirport || 'LHR'})`, 370, 195);

      doc.fillColor('#718096')
         .fontSize(9)
         .text('Scheduled Time:', 185, 210)
         .text('Scheduled Time:', 370, 210);

      doc.fillColor('#2D3748')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(bookingDetails.departureTime || 'May 25, 2026 - 10:00 AM', 185, 222)
         .text(bookingDetails.arrivalTime || 'May 25, 2026 - 10:00 PM', 370, 222);

      doc.strokeColor('#E2E8F0')
         .lineWidth(1)
         .moveTo(50, 255)
         .lineTo(545, 255)
         .stroke();

      doc.fillColor('#1A365D')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('PASSENGER & SEATING', 50, 270);

      doc.fillColor('#718096')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('PASSENGER NAME', 50, 295)
         .text('SEAT NUMBER', 260, 295)
         .text('FLIGHT CLASS', 390, 295);

      doc.fillColor('#2D3748')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(bookingDetails.passengerName || 'John Doe', 50, 310)
         .fontSize(16)
         .fillColor('#DD6B20') // Standout orange accent for Seat
         .text(bookingDetails.seatNumber || '22C', 260, 310)
         .fontSize(11)
         .fillColor('#2D3748')
         .text(bookingDetails.flightClass || 'Economy', 390, 310);

      doc.strokeColor('#E2E8F0')
         .lineWidth(1)
         .moveTo(50, 345)
         .lineTo(545, 345)
         .stroke();

      doc.rect(50, 360, 495, 75)
         .fill('#F8FAFC');

      doc.strokeColor('#E2E8F0')
         .lineWidth(1)
         .rect(50, 360, 495, 75)
         .stroke();

      doc.fillColor('#718096')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('BOOKING ID', 70, 375)
         .text('TOTAL AMOUNT PAID', 230, 375)
         .text('BOOKING STATUS', 390, 375);

      doc.fillColor('#1A365D')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(bookingDetails.bookingId || 'BK-1004928', 70, 390);

      const fare = typeof bookingDetails.totalPrice === 'number'
        ? `$${bookingDetails.totalPrice.toFixed(2)}`
        : (bookingDetails.totalPrice || '$350.00');

      doc.fillColor('#2B6CB0')
         .fontSize(13)
         .text(fare, 230, 390);

      doc.fillColor('#38A169')
         .fontSize(12)
         .text('CONFIRMED', 390, 390);

      doc.strokeColor('#CBD5E0')
         .lineWidth(1.5)
         .dash(4, { space: 4 })
         .moveTo(50, 465)
         .lineTo(545, 465)
         .stroke();

      doc.undash();

      doc.fillColor('#4A5568')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('IMPORTANT INSTRUCTIONS', 50, 490);

      const instructions = [
         '1. Please arrive at the airport at least 3 hours prior to international flights and 2 hours for domestic flights.',
         '2. Carry a valid government-issued photo ID or passport matching this boarding pass.',
         '3. Web check-in closes 60 minutes before departure. Gate closes 25 minutes prior to takeoff.',
         '4. Carry-on luggage rules apply. Please check your airline details for dimensions and limits.'
      ];

      let yPos = 510;
      doc.fontSize(8.5)
         .fillColor('#718096')
         .font('Helvetica');

      instructions.forEach(ins => {
         doc.text(ins, 50, yPos, { width: 320 });
         yPos += doc.heightOfString(ins, { width: 320 }) + 3;
      });

      doc.font('Helvetica-Bold')
         .fillColor('#1A365D')
         .fontSize(10)
         .text('Thank you for choosing SkyRoute Airlines!', 50, 610);

      if (qrBuffer) {
        doc.image(qrBuffer, 395, 480, { width: 130, height: 130 });
        doc.fillColor('#718096')
           .fontSize(8)
           .font('Helvetica-Oblique')
           .text('Scan for Verification', 395, 615, { align: 'center', width: 130 });
      }

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateTicketPDF
};
