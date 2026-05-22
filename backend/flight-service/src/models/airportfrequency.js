"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AirportFrequency extends Model {
    static associate(models) {}
  }
  AirportFrequency.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      airportRef: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      airportIdent: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      frequencyMhz: {
        type: DataTypes.FLOAT,
      },
    },
    {
      sequelize,
      modelName: "AirportFrequency",
      tableName: "AirportFrequencies",
    },
  );
  return AirportFrequency;
};
