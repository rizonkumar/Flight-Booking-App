const express = require("express");

const { AirportController } = require("../../controllers");
const { ValidationMiddleware } = require("../../middlewares");

const router = express.Router();

router.post(
  "/",
  ValidationMiddleware.validateCreateAirport,
  AirportController.createAirport
);

router.get("/", AirportController.getAirports);
router.get("/:id", AirportController.getAirport);

router.delete("/:id", AirportController.deleteAirport);

module.exports = router;
