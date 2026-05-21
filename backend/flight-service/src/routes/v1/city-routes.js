const express = require("express");

const { CityController } = require("../../controllers");
const { ValidationMiddleware } = require("../../middlewares");

const router = express.Router();

router.post(
  "/",
  ValidationMiddleware.validateCreateCity,
  CityController.createCity
);

router.get("/", CityController.getCities);

router.patch(
  "/:id",
  ValidationMiddleware.validateUpdateCity,
  CityController.updateCity
);

router.delete("/:id", CityController.deleteCity);

module.exports = router;
