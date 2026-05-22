"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Runway extends Model {
    static associate(models) {}
  }
  Runway.init(
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
      lengthFt: {
        type: DataTypes.INTEGER,
      },
      widthFt: {
        type: DataTypes.INTEGER,
      },
      surface: {
        type: DataTypes.STRING,
      },
      lighted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      closed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      leIdent: {
        type: DataTypes.STRING,
      },
      leLatitude: {
        type: DataTypes.FLOAT,
      },
      leLongitude: {
        type: DataTypes.FLOAT,
      },
      leElevation: {
        type: DataTypes.INTEGER,
      },
      leHeadingT: {
        type: DataTypes.FLOAT,
      },
      leDisplacedThreshold: {
        type: DataTypes.INTEGER,
      },
      heIdent: {
        type: DataTypes.STRING,
      },
      heLatitude: {
        type: DataTypes.FLOAT,
      },
      heLongitude: {
        type: DataTypes.FLOAT,
      },
      heElevation: {
        type: DataTypes.INTEGER,
      },
      heHeadingT: {
        type: DataTypes.FLOAT,
      },
      heDisplacedThreshold: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Runway",
      tableName: "Runways",
    },
  );
  return Runway;
};
