const express = require("express");

const { FlightController } = require("../../controllers");
const { ValidationMiddleware } = require("../../middlewares");
const router = express.Router();

router.post(
  "/",
  ValidationMiddleware.validateCreateFlight,
  FlightController.createFlight
);

router.get("/", FlightController.getAllFlights);

router.get("/:id", FlightController.getFlight);

router.patch(
  "/:id/seats",
  ValidationMiddleware.validateUpdateSeats,
  FlightController.updateSeats
);

module.exports = router;
