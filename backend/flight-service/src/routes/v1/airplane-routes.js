const express = require("express");

const { AirplaneController } = require("../../controllers");
const { ValidationMiddleware } = require("../../middlewares");

const router = express.Router();

router.post(
  "/",
  ValidationMiddleware.validateCreateAirplane,
  AirplaneController.createAirplane
);

router.get("/", AirplaneController.getAirplanes);
router.get("/:id", AirplaneController.getAirplane);

router.delete("/:id", AirplaneController.deleteAirplane);

router.patch(
  "/:id",
  ValidationMiddleware.validateUpdateAirplane,
  AirplaneController.updateAirplane
);

module.exports = router;
