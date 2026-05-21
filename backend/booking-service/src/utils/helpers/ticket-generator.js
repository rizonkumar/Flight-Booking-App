const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");


async function generateTicketPDF(booking, flight) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A6", margin: 15 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      doc
        .rect(0, 0, doc.page.width, 45)
        .fill("#0f172a");

      doc
        .fillColor("#ffffff")
        .fontSize(14)
        .text("🛫 SkyRoute Airlines", 15, 15, { align: "left" });

      doc
        .fontSize(10)
        .fillColor("#94a3b8")
        .text("BOARDING PASS", 15, 18, { align: "right" });

      doc.y = 55;
      doc
        .rect(15, doc.y, doc.page.width - 30, 80)
        .lineWidth(1)
        .stroke("#e2e8f0");

      const boxY = doc.y + 8;
      doc
        .fillColor("#64748b")
        .fontSize(8)
        .text("FLIGHT", 25, boxY)
        .fillColor("#0f172a")
        .fontSize(12)
        .text(flight.flightNumber || "SK-999", 25, boxY + 12);

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .text("ROUTE", 110, boxY)
        .fillColor("#0f172a")
        .fontSize(12)
        .text(`${flight.departureAirportId} → ${flight.arrivalAirportId}`, 110, boxY + 12);

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .text("DEPARTURE TIME", 25, boxY + 38)
        .fillColor("#0f172a")
        .fontSize(9)
        .text(new Date(flight.departureTime).toLocaleString(), 25, boxY + 48);

      const detailsY = 145;
      doc
        .fillColor("#64748b")
        .fontSize(8)
        .text("PASSENGER NAME", 15, detailsY)
        .fillColor("#0f172a")
        .fontSize(10)
        .text(booking.passengerName || `User #${booking.userId}`, 15, detailsY + 10);

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .text("BOOKING REF", 110, detailsY)
        .fillColor("#0f172a")
        .fontSize(10)
        .text(`SR-${booking.id}`, 110, detailsY + 10);

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .text("SEATS BOOKED", 15, detailsY + 30)
        .fillColor("#0f172a")
        .fontSize(10)
        .text(`${booking.noOfSeats} Seat(s)`, 15, detailsY + 40);

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .text("TOTAL FARE", 110, detailsY + 30)
        .fillColor("#16a34a")
        .fontSize(10)
        .text(`INR ${booking.totalCost}`, 110, detailsY + 40);

      // ─── QR Code generation and placement ──────────────────────────────────────
      const qrData = JSON.stringify({
        bookingId: booking.id,
        flightId: booking.flightId,
        userId: booking.userId,
        noOfSeats: booking.noOfSeats,
        totalCost: booking.totalCost,
      });

      const qrCodeBuffer = await QRCode.toBuffer(qrData, {
        margin: 1,
        width: 80,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      doc.image(qrCodeBuffer, doc.page.width - 95, detailsY - 10, { width: 75 });

      // ─── Footer ──────────────────────────────────────────────────────────────
      doc
        .rect(0, doc.page.height - 25, doc.page.width, 25)
        .fill("#f1f5f9");

      doc
        .fillColor("#64748b")
        .fontSize(7)
        .text("Thank you for flying with SkyRoute Airlines. Have a safe flight!", 15, doc.page.height - 17, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateTicketPDF };
