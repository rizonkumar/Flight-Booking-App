"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    static associate(models) {}
  }
  Region.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      localCode: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      continent: {
        type: DataTypes.STRING,
      },
      isoCountry: {
        type: DataTypes.STRING,
      },
      wikipediaLink: {
        type: DataTypes.STRING,
      },
      keywords: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "Region",
      tableName: "Regions",
    },
  );
  return Region;
};
