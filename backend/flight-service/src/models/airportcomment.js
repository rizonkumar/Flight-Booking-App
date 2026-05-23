"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AirportComment extends Model {
    static associate(models) {}
  }
  AirportComment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      threadRef: {
        type: DataTypes.INTEGER,
      },
      airportRef: {
        type: DataTypes.INTEGER,
      },
      airportIdent: {
        type: DataTypes.STRING,
      },
      date: {
        type: DataTypes.DATE,
      },
      memberNickname: {
        type: DataTypes.STRING,
      },
      subject: {
        type: DataTypes.STRING,
      },
      body: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "AirportComment",
      tableName: "AirportComments",
    },
  );
  return AirportComment;
};
