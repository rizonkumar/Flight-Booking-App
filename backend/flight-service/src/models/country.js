"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    static associate(models) {}
  }
  Country.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      continent: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "Country",
      tableName: "Countries",
    },
  );
  return Country;
};
